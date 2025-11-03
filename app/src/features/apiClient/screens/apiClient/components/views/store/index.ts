import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { EntryStoreState } from "componentsV2/Tabs/types";
import { getEmptyDraftApiRecord } from "../../../utils";
import { createQueryParamsStore, QueryParamsStore } from "features/apiClient/store/queryParamsStore";
import {
  createPathVariablesStore,
  PathVariablesStore,
} from "features/apiClient/store/pathVariables/pathVariables.store";
import { StoreApi } from "zustand";
import { queryParamsToURLString } from "../../../utils";

export type RequestViewStore = EntryStoreState & {
  apiEntryDetails: RQAPI.ApiRecord;
  setApiEntryDetails: (apiEntryDetails: RQAPI.ApiRecord) => void;
  updatePostResponseScript: (script: string) => void;
  queryParamsStore: StoreApi<QueryParamsStore>;
  pathVariablesStore: StoreApi<PathVariablesStore>;
};

export type CollectionViewStore = {
  collectionRecord: RQAPI.CollectionRecord;
  setCollectionRecord: (collectionRecord: RQAPI.CollectionRecord) => void;
};

export const createRequestViewStore = (apiEntryDetails?: RQAPI.ApiRecord) => {
  const defaultApiEntryDetails = apiEntryDetails ?? getEmptyDraftApiRecord(RQAPI.ApiEntryType.HTTP);
  const entry = defaultApiEntryDetails?.data as RQAPI.HttpApiEntry | undefined;

  const entryForQueryParams = entry || (getEmptyDraftApiRecord(RQAPI.ApiEntryType.HTTP).data as RQAPI.HttpApiEntry);
  const queryParamsStore = createQueryParamsStore(entryForQueryParams);
  const pathVariablesStore = createPathVariablesStore(entry?.request?.pathVariables ?? []);

  const requestViewStore = create<RequestViewStore>((set, get) => ({
    recordId: defaultApiEntryDetails?.id ?? "draft",
    apiEntryDetails: defaultApiEntryDetails,
    entry: defaultApiEntryDetails?.data ?? null,
    queryParamsStore,
    pathVariablesStore,
    setEntry: (newEntry: RQAPI.ApiEntry) => {
      const apiEntryDetails = get().apiEntryDetails;
      set({
        entry: newEntry,
        apiEntryDetails: {
          ...apiEntryDetails,
          data: newEntry,
        },
      });
    },
    setApiEntryDetails: (apiEntryDetails: RQAPI.ApiRecord) => {
      set({
        apiEntryDetails,
        entry: apiEntryDetails?.data ?? null,
      });
    },
    updatePostResponseScript: (script: string) => {
      const apiEntryDetails = get().apiEntryDetails;
      const updatedEntry = {
        ...apiEntryDetails.data,
        scripts: { preRequest: apiEntryDetails.data.scripts?.preRequest ?? "", postResponse: script },
      };
      set({
        apiEntryDetails: {
          ...apiEntryDetails,
          data: updatedEntry,
        },
        entry: updatedEntry,
      });
    },
  }));

  let previousQueryParams = queryParamsStore.getState().queryParams;
  queryParamsStore.subscribe((state) => {
    const currentQueryParams = state.queryParams;

    if (JSON.stringify(currentQueryParams) === JSON.stringify(previousQueryParams)) {
      return;
    }
    previousQueryParams = currentQueryParams;

    const currentState = requestViewStore.getState();
    const currentEntry = currentState.entry as RQAPI.HttpApiEntry | null;

    if (!currentEntry || currentEntry.type !== RQAPI.ApiEntryType.HTTP) {
      return;
    }

    const currentUrl = currentEntry.request?.url || "";
    const updatedUrl = queryParamsToURLString(currentQueryParams, currentUrl);

    const updatedEntry: RQAPI.HttpApiEntry = {
      ...currentEntry,
      request: {
        ...currentEntry.request,
        url: updatedUrl,
        queryParams: currentQueryParams,
      },
    };

    requestViewStore.getState().setEntry(updatedEntry);
  });

  return requestViewStore;
};

export const createCollectionViewStore = (record: RQAPI.CollectionRecord) => {
  return create<CollectionViewStore>((set, get) => ({
    collectionRecord: record,
    setCollectionRecord: (collectionRecord: RQAPI.CollectionRecord) => {
      set({ collectionRecord });
    },
  }));
};
