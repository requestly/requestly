import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { getEmptyDraftApiRecord } from "../../../utils";
import { createQueryParamsStore, QueryParamsStore } from "features/apiClient/store/queryParamsStore";
import {
  createPathVariablesStore,
  PathVariablesStore,
} from "features/apiClient/store/pathVariables/pathVariables.store";
import { StoreApi } from "zustand";
import { queryParamsToURLString } from "../../../utils";
import { BaseApiEntryStoreState, createBaseApiEntryState } from "features/apiClient/store/apiRecord/base";

export type RequestViewState = BaseApiEntryStoreState<
  RQAPI.ApiEntry,
  {
    record: RQAPI.ApiRecord; // todo: reconsider
    // setApiEntryDetails: (apiEntryDetails: RQAPI.ApiRecord) => void; // todo: break down
    // updatePostResponseScript: (script: string) => void;
    queryParamsStore: StoreApi<QueryParamsStore>;
    pathVariablesStore: StoreApi<PathVariablesStore>;

    // updateQueryParans
    // update URL
  }
>;

export const createRequestViewStore = (apiRecordDetails?: RQAPI.ApiRecord) => {
  const defaultRecordDetails = apiRecordDetails ?? getEmptyDraftApiRecord(RQAPI.ApiEntryType.HTTP);
  const entry = defaultRecordDetails?.data as RQAPI.HttpApiEntry;

  // fix-me: copy not needed
  const entryForQueryParams = entry || (getEmptyDraftApiRecord(RQAPI.ApiEntryType.HTTP).data as RQAPI.HttpApiEntry);
  const queryParamsStore = createQueryParamsStore(entryForQueryParams);
  const pathVariablesStore = createPathVariablesStore(entry?.request?.pathVariables ?? []);

  const requestViewStore = create<RequestViewState>((set, get) => {
    const baseStore = createBaseApiEntryState(entry, defaultRecordDetails?.id, set, get);
    const extendedField = {
      record: defaultRecordDetails,
      queryParamsStore,
      pathVariablesStore,
    };
    return {
      ...baseStore,
      ...extendedField,
    };
  });

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

    requestViewStore.getState().updateEntry(updatedEntry);
  });

  return requestViewStore;
};
