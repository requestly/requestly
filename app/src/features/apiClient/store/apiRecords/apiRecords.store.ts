import { NativeError } from "errors/NativeError";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { CollectionVariableMap, RequestContentType, RQAPI } from "features/apiClient/types";
import { create, StoreApi } from "zustand";
import { EnvVariableState, parseEnvVariables } from "../variables/variables.store";
import { ApiClientFile, apiClientFileStore, FileFeature, FileId } from "../apiClientFilesStore";
import { PersistedVariables } from "../shared/variablePersistence";
import { ApiClientFeatureContext } from "../apiClientFeatureContext/apiClientFeatureContext.store";
import { TreeChanged } from "features/apiClient/helpers/apiClientTreeBus/apiClientTreeBus";
import { generateKeyValuePairs, isHttpApiRecord } from "features/apiClient/screens/apiClient/utils";

function getFilesFromRecord(record: RQAPI.ApiClientRecord) {
  const files: Record<FileId, ApiClientFile> = {};
  const canHaveFiles =
    record.type === RQAPI.RecordType.API &&
    isHttpApiRecord(record) &&
    record.data.request.contentType === RequestContentType.MULTIPART_FORM;

  if (!canHaveFiles) {
    return;
  }

  let requestBody = record.data.request.body as RQAPI.MultipartFormBody;

  if (!requestBody) {
    return;
  }

  // hotfix for existing requests
  if (!Array.isArray(requestBody)) {
    requestBody = generateKeyValuePairs(requestBody);
  }

  for (const bodyEntry of requestBody) {
    const bodyValue = bodyEntry.value as RQAPI.FormDataKeyValuePair["value"];
    if (Array.isArray(bodyValue)) {
      bodyValue?.forEach((file) => {
        files[file.id] = {
          name: file.name,
          path: file.path,
          source: file.source,
          size: file.size,
          isFileValid: true,
          fileFeature: FileFeature.FILE_BODY,
        };
      });
    }
  }

  return files;
}

function parseRecordsToFiles(records: RQAPI.ApiClientRecord[]) {
  let files: Record<FileId, ApiClientFile> = {};
  for (const record of records) {
    const filesFromRecord = getFilesFromRecord(record);
    if (filesFromRecord) {
      files = { ...files, ...filesFromRecord };
    }
  }

  return files;
}

type BaseRecordState = {
  type: RQAPI.RecordType;
  version: number;
  record: RQAPI.ApiClientRecord;
  updateRecordState: (patch: Partial<RQAPI.ApiClientRecord>) => void;
  incrementVersion: () => void;
};

export type ApiRecordState = BaseRecordState & {
  type: RQAPI.RecordType.API;
  record: RQAPI.ApiRecord;
};

export type CollectionRecordState = BaseRecordState & {
  type: RQAPI.RecordType.COLLECTION;
  record: RQAPI.CollectionRecord;
  collectionVariables: StoreApi<EnvVariableState>;
  persistence: PersistedVariables.Store;
};

export type RecordState = ApiRecordState | CollectionRecordState;

export type ApiRecordsState = {
  /**
   * This is the list of records that are currently in the apiClientRecords.
   */
  apiClientRecords: RQAPI.ApiClientRecord[];

  /**
   * This maintains a map of child <-> parent. This field is mostly for internal use,
   * since it will get updated when any relationship changes. So try not to use this
   * unless you want to listen to all changes.
   */
  childParentMap: Map<string, string>;

  /**
   * This is a helper map, which provides actual data for a given id. Again, not for external use
   * unless neccessary.
   */
  index: Map<string, RQAPI.ApiClientRecord>;

  /**
   * This maintains a version for each entity. This version is kept in a zunstand store so that
   * one can use it as a hook and react whenever it changes.
   */
  indexStore: Map<string, StoreApi<RecordState>>;

  getParentChain: (id: string) => string[];
  getAllChildren: (id: string) => string[];

  /**
   * It updates the version of children of given entity. Meaning any component relying on version
   * will get re-rendered.
   */
  triggerUpdateForChildren: (id: string) => void;

  /**
   * This is called to update/sync the internal data with external changes happening in apiClientRecords.
   */
  refresh: (records: RQAPI.ApiClientRecord[]) => void;
  getData: (id: RQAPI.ApiClientRecord["id"] | null) => RQAPI.ApiClientRecord | undefined;
  getParent: (id: string) => string | undefined;
  getRecordStore: (id: string) => StoreApi<RecordState> | undefined;
  getAllRecords: () => RQAPI.ApiClientRecord[];

  addNewRecord: (record: RQAPI.ApiClientRecord) => void;
  addNewRecords: (records: RQAPI.ApiClientRecord[]) => void;
  updateRecord: (record: RQAPI.ApiClientRecord) => void;
  updateRecords: (records: RQAPI.ApiClientRecord[]) => void;
  deleteRecords: (recordIds: string[]) => void;

  /**
   * finds the collection whose variables need to be updated
   * calls mergeAndUpdate on the collectionVariables store of that collection
   */
  updateCollectionVariables: (variables: CollectionVariableMap) => void;

  /**
   * Gets the immediate children of a given collection
   */

  getDirectChildren: (id: string) => string[];
};

const getImmediateChildren = (id: string, childParentMap: Map<string, string>) =>
  Array.from(childParentMap.entries())
    .filter(([_, v]) => v === id)
    .map(([k, _]) => k);

export function getAllChildren(initalId: string, childParentMap: Map<string, string>) {
  const result: string[] = [];

  const parseRecursively = (id: string) => {
    const children = getImmediateChildren(id, childParentMap);
    result.push(...children);
    children.forEach(parseRecursively);
  };
  parseRecursively(initalId);
  return result;
}

function parseRecords(records: RQAPI.ApiClientRecord[]) {
  const childParentMap = new Map<string, string>();
  const index = new Map<string, RQAPI.ApiClientRecord>();

  for (const record of records) {
    childParentMap.set(record.id, record.collectionId ?? "");
    index.set(record.id, record);
  }

  return {
    childParentMap,
    index,
  };
}

export const createRecordStore = (record: RQAPI.ApiClientRecord, contextId: string = "private") => {
  return create<CollectionRecordState | ApiRecordState>()((set, get) => {
    const baseRecordState: BaseRecordState = {
      type: record.type,
      version: 0,
      record,
      updateRecordState: (patch: Partial<RQAPI.ApiClientRecord>) => {
        const record = get().record;
        const updatedRecord = { ...record, ...patch } as RQAPI.ApiClientRecord;
        set({
          record: updatedRecord,
        } as RecordState);
        get().incrementVersion();
      },
      incrementVersion: () => {
        set({
          version: get().version + 1,
        });
      },
    };

    if (record.type === RQAPI.RecordType.API) {
      return baseRecordState as ApiRecordState;
    }

    const variablesStore = PersistedVariables.createCollectionVariablesStore(
      contextId,
      record.id,
      record.data?.variables
    );
    return {
      ...baseRecordState,
      collectionVariables: variablesStore,
    } as CollectionRecordState;
  });
};

function createIndexStore(index: ApiRecordsState["index"]) {
  const indexStore = new Map<string, StoreApi<RecordState>>();
  for (const [id] of index) {
    indexStore.set(id, createRecordStore(index.get(id) as RQAPI.ApiClientRecord));
  }

  return indexStore;
}

export const createApiRecordsStore = (
  context: ApiClientFeatureContext,
  initialRecords: {
    records: RQAPI.ApiClientRecord[];
    erroredRecords: ErroredRecord[];
  }
) => {
  const { childParentMap: initialChildParentMap, index: initialIndex } = parseRecords(initialRecords.records);
  return create<ApiRecordsState>()((set, get) => ({
    apiClientRecords: initialRecords.records,
    erroredRecords: initialRecords.erroredRecords,

    childParentMap: initialChildParentMap,
    index: initialIndex,

    indexStore: createIndexStore(initialIndex),

    refresh(records) {
      const { indexStore } = get();
      const { childParentMap, index } = parseRecords(records);

      for (const [id] of index) {
        if (!indexStore.has(id)) {
          indexStore.set(id, createRecordStore(index.get(id) as RQAPI.ApiClientRecord));
        }
      }

      for (const [id] of indexStore) {
        if (!index.has(id)) {
          indexStore.delete(id);
        }
      }

      // We initimate the file store to sync with updated records.
      // This is not performant, as we'd want to provide granular updates
      // so that the file store is only contacted with changed records.
      // This works out only because there's no reactive field in the file store
      // and frequent resetting doesn't cause any renders.
      // TODO: Send patches to file store
      apiClientFileStore.getState().replace(parseRecordsToFiles(records), FileFeature.FILE_BODY);
      set({
        apiClientRecords: records,
        childParentMap,
        index,
        indexStore,
      });
    },

    getData(id) {
      const { index } = get();
      if (!id) return undefined;
      return index.get(id);
    },

    getParent(id) {
      const { childParentMap } = get();
      return childParentMap.get(id);
    },

    getParentChain(id) {
      const { getParent } = get();
      const result: string[] = [];
      const parseRecursively = (id: string) => {
        const parent = getParent(id);
        if (!parent) {
          return;
        }
        result.push(parent);
        parseRecursively(parent);
      };
      parseRecursively(id);
      return result;
    },

    triggerUpdateForChildren(id) {
      const { childParentMap, indexStore } = get();

      const allChildren = getAllChildren(id, childParentMap);

      allChildren.forEach((cid) => {
        const recordStore = indexStore.get(cid);

        if (!recordStore) {
          throw new NativeError("Record store does not exist!").addContext({ id: cid });
        }

        recordStore.getState().incrementVersion();
      });
    },

    addNewRecord(record) {
      const updatedRecords = [...get().apiClientRecords, record];
      get().refresh(updatedRecords);
      context.treeBus.emit(new TreeChanged(record.id));
    },

    addNewRecords(records) {
      const updatedRecords = [...get().apiClientRecords, ...records];
      get().refresh(updatedRecords);
      updatedRecords.forEach((r) => context.treeBus.emit(new TreeChanged(r.id)));
    },

    updateRecord(patch) {
      const existingRecords = get().apiClientRecords;

      const existingCollectionId = existingRecords.find((r) => r.id === patch.id)?.collectionId;
      const newCollectionId = patch.collectionId;

      const treeBusEmitEffect = context.treeBus.getEmitEffect(new TreeChanged(patch.id));

      const updatedRecords = existingRecords.map((r) => (r.id === patch.id ? { ...r, ...patch } : r));
      get().refresh(updatedRecords);

      const recordStore = get().getRecordStore(patch.id);

      if (!recordStore) {
        throw new NativeError("Record store does not exist!").addContext({ id: patch.id });
      }

      const { updateRecordState } = recordStore.getState();
      updateRecordState(patch);
      get().triggerUpdateForChildren(patch.id);

      if (existingCollectionId !== newCollectionId) {
        treeBusEmitEffect?.();
        context.treeBus.emit(new TreeChanged(patch.id));
      }
    },

    updateRecords(patches) {
      const patchMap = new Map(patches.map((r) => [r.id, r]));
      const updatedRecords = get().apiClientRecords.map((r) =>
        patchMap.has(r.id) ? { ...r, ...patchMap.get(r.id) } : r
      );
      get().refresh(updatedRecords);

      const updatedRecordMap = new Map(updatedRecords.map((r) => [r.id, r]));
      for (const patch of patches) {
        const updatedRecord = updatedRecordMap.get(patch.id);
        const existingCollectionId = updatedRecord?.collectionId;
        const newCollectionId = patch?.collectionId;
        const treeBusEmitEffect = context.treeBus.getEmitEffect(new TreeChanged(patch.id));

        if (updatedRecord) {
          const recordStore = get().getRecordStore(patch.id);

          if (!recordStore) {
            throw new NativeError("Record store does not exist!").addContext({ id: patch.id });
          }

          const { updateRecordState } = recordStore.getState();
          updateRecordState(patch);
          get().triggerUpdateForChildren(patch.id);

          if (existingCollectionId !== newCollectionId) {
            treeBusEmitEffect?.();
            context.treeBus.emit(new TreeChanged(patch.id));
          }
        }
      }
    },

    updateCollectionVariables(variables) {
      const { indexStore } = get();
      for (const [recordId, newData] of Object.entries(variables)) {
        const record = indexStore.get(recordId)?.getState();
        if (record && record.type === RQAPI.RecordType.COLLECTION) {
          record.collectionVariables.getState().resetSyncValues(parseEnvVariables(newData.variables));
        }
      }
    },

    deleteRecords(recordIds) {
      const treeBusEmitEffect = recordIds.map((recordId) => context.treeBus.getEmitEffect(new TreeChanged(recordId)));

      const updatedRecords = get().apiClientRecords.filter((r) => !recordIds.includes(r.id));

      get().refresh(updatedRecords);

      treeBusEmitEffect.forEach((emit) => emit?.());
    },

    getRecordStore(id) {
      const { indexStore } = get();
      const recordStore = indexStore.get(id);
      return recordStore;
    },

    getAllRecords() {
      return get().apiClientRecords;
    },

    getAllChildren: (id: string) => getAllChildren(id, get().childParentMap),

    getDirectChildren: (id: string) => getImmediateChildren(id, get().childParentMap),
  }));
};
