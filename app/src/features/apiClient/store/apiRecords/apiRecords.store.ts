import { RQAPI } from "features/apiClient/types";
import { create, StoreApi } from "zustand";

export type VersionState = {
  version: number;

  increment: () => void;
}

export type ApiRecordsState = {
  childParentMap: Map<string, string>,
  index: Map<string, RQAPI.Record>,
  indexStore: Map<string, StoreApi<VersionState>>,
  triggerUpdateQueue: Set<string>,

  getParentChain: (id: string) => string[],
  refresh: (records: RQAPI.Record[]) => void,
  getData: (id: string) => RQAPI.Record,
  getParent: (id: string) => string | undefined,
  getVersionStore: (id: string) => StoreApi<VersionState>,

  triggerUpdate: (id: string) => void,
  queueTriggerUpdate: (id: string) => void,
};

function parseRecords(records: RQAPI.Record[]) {
  const childParentMap = new Map<string, string>();
  const index = new Map<string, RQAPI.Record>();

  for (const record of records) {
    if(record.collectionId) {
      childParentMap.set(record.id, record.collectionId);
    }
    index.set(record.id, record);
  }

  debugger;

  return {
    childParentMap,
    index,
  }
};

function getAllChildren(initalId: string, childParentMap: Map<string, string>) {
  const result: string[] = [];
  const getImmediateChildren = (id: string) => Array.from(childParentMap.entries()).filter(([_, v]) => v === id).map(([k, _]) => k);
  const parseRecursively = (id: string) => {
    const children = getImmediateChildren(id);
    result.push(...children);
    children.forEach(parseRecursively);
  }
  parseRecursively(initalId);
  return result;
}

function incrementVersion(store: StoreApi<VersionState>) {
  store.getState().increment();
}


export function createVersionStore() {
  return create<VersionState>()((set, get) => ({
    version: 0,

    increment() {
      const {version} = get();
      set({
        version: version + 1,
      })
    }
  }));
}

function createIndexStore(index: ApiRecordsState['index']) {
  const indexStore = new Map<string, StoreApi<VersionState>>();
  for (const [id] of index) {
    indexStore.set(id, createVersionStore());
  }

  return indexStore;
}

export const createApiRecordsStore = (intialRecords: RQAPI.Record[]) => {
  const { childParentMap: initialChildParentMap, index: initialIndex } = parseRecords(intialRecords);
  return create<ApiRecordsState>()((set, get) => ({
    childParentMap: initialChildParentMap,
    index: initialIndex,
    triggerUpdateQueue: new Set(),

    indexStore: createIndexStore(initialIndex),

    refresh(records) {
      const { indexStore, triggerUpdateQueue, triggerUpdate } = get();
      const { childParentMap, index } = parseRecords(records);

      for (const [id] of index) {
        if (!indexStore.has(id)) {
          indexStore.set(id, createVersionStore());
        }
      }

      for (const [id] of indexStore) {
        if (!index.has(id)) {
          indexStore.delete(id);
        }
      }

      debugger;

      set({
        childParentMap,
        index,
        indexStore,
      });

      for (const pendingId of triggerUpdateQueue) {
        triggerUpdate(pendingId);
      }

      set({
        triggerUpdateQueue: new Set(),
      })
    },

    getData(id) {
      const { index } = get();
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
      }
      parseRecursively(id);
      return result;
    },

    triggerUpdate(id) {
      const { childParentMap, indexStore } = get();
      incrementVersion(indexStore.get(id));

      const allChildren = getAllChildren(id, childParentMap);

      allChildren.forEach(cid => {
        incrementVersion(indexStore.get(cid));
      })
    },

    getVersionStore(id) {
      const { indexStore } = get();
      const versionStateStore = indexStore.get(id);
      return versionStateStore;
    },

    queueTriggerUpdate(id) {
      const { triggerUpdateQueue } = get();
      triggerUpdateQueue.add(id);

      set({
        triggerUpdateQueue,
      })
    },

  }));
};
