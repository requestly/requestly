import { useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { EntityId } from "../types";
import { selectRecordById } from "./selectors";
import { HttpRequestUpdater, GraphQLRequestUpdater } from "../updaters";
import { useApiClientDispatch, useApiClientSelector } from "../hooks/base.hooks";
import { ApiClientRootState } from "../hooks/types";

const makeSelectRequestRecord = () =>
  createSelector([(state: ApiClientRootState, id: EntityId) => selectRecordById(state, id)], (record) => {
    if (record?.type === RQAPI.RecordType.API) {
      return record;
    }
    return undefined;
  });

export function useRequestRecord(id: EntityId) {
  const selectRecord = useMemo(makeSelectRequestRecord, []);
  return useApiClientSelector((state) => selectRecord(state, id));
}

export function useHttpRequestUpdater(id: EntityId) {
  const dispatch = useApiClientDispatch();
  return useMemo(() => new HttpRequestUpdater(dispatch, { id }), [dispatch, id]);
}

export function useGraphQLRequestUpdater(id: EntityId) {
  const dispatch = useApiClientDispatch();
  return useMemo(() => new GraphQLRequestUpdater(dispatch, { id }), [dispatch, id]);
}

export function useHttpRequestRecord(id: EntityId) {
  const record = useRequestRecord(id);
  const updater = useHttpRequestUpdater(id);
  return { record, updater };
}

export function useGraphQLRequestRecord(id: EntityId) {
  const record = useRequestRecord(id);
  const updater = useGraphQLRequestUpdater(id);
  return { record, updater };
}

export function useHttpRequest(id: EntityId) {
  const record = useRequestRecord(id);
  const recordUpdater = useHttpRequestUpdater(id);
  return { record, recordUpdater };
}

export function useGraphQLRequest(id: EntityId) {
  const record = useRequestRecord(id);
  const recordUpdater = useGraphQLRequestUpdater(id);
  return { record, recordUpdater };
}

export function useRequest(id: EntityId) {
  const record = useRequestRecord(id);
  const isGraphQL = record?.data?.type === RQAPI.ApiEntryType.GRAPHQL;

  const httpRecordUpdater = useHttpRequestUpdater(id);
  const graphqlRecordUpdater = useGraphQLRequestUpdater(id);

  return {
    record,
    recordUpdater: isGraphQL ? graphqlRecordUpdater : httpRecordUpdater,
    isGraphQL,
  };
}
