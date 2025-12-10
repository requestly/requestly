import { useEffect, useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { EntityId, BufferWrapper } from "../types";
import { selectRecordById } from "./selectors";
import { selectBufferById } from "../buffers/selectors";
import { buffersActions } from "../buffers/slice";
import {
  HttpRequestUpdater,
  HttpRequestBufferUpdater,
  GraphQLRequestUpdater,
  GraphQLRequestBufferUpdater,
} from "../updaters";
import { useApiClientDispatch, useApiClientSelector } from "../../hooks/base.hooks";
import { ApiClientRootState } from "../../hooks/types";

const makeSelectRequestRecord = () =>
  createSelector(
    [(state: ApiClientRootState, id: EntityId) => selectRecordById(state, id)],
    (record) => record as RQAPI.ApiRecord | undefined
  );

const makeSelectRequestBuffer = () =>
  createSelector(
    [(state: ApiClientRootState, id: EntityId) => selectBufferById(state, id)],
    (buffer) => buffer as BufferWrapper<RQAPI.ApiRecord> | undefined
  );

const makeSelectRequestData = () =>
  createSelector(
    [
      (state: ApiClientRootState, id: EntityId) => selectRecordById(state, id),
      (state: ApiClientRootState, id: EntityId) => selectBufferById(state, id),
    ],
    (record, buffer) => ({
      record: record as RQAPI.ApiRecord | undefined,
      buffer: buffer as BufferWrapper<RQAPI.ApiRecord> | undefined,
    })
  );

export function useRequestRecord(id: EntityId) {
  const selectRecord = useMemo(makeSelectRequestRecord, []);
  return useApiClientSelector((state) => selectRecord(state, id));
}

export function useRequestBuffer(id: EntityId) {
  const selectBuffer = useMemo(makeSelectRequestBuffer, []);
  return useApiClientSelector((state) => selectBuffer(state, id));
}

export function useRequestData(id: EntityId) {
  const selectData = useMemo(makeSelectRequestData, []);
  return useApiClientSelector((state) => selectData(state, id));
}

export function useHttpRequestUpdater(id: EntityId) {
  const dispatch = useApiClientDispatch();
  return useMemo(() => new HttpRequestUpdater(dispatch, { id }), [dispatch, id]);
}

export function useHttpRequestBufferUpdater(id: EntityId) {
  const dispatch = useApiClientDispatch();
  return useMemo(() => new HttpRequestBufferUpdater(dispatch, { id }), [dispatch, id]);
}

export function useGraphQLRequestUpdater(id: EntityId) {
  const dispatch = useApiClientDispatch();
  return useMemo(() => new GraphQLRequestUpdater(dispatch, { id }), [dispatch, id]);
}

export function useGraphQLRequestBufferUpdater(id: EntityId) {
  const dispatch = useApiClientDispatch();
  return useMemo(() => new GraphQLRequestBufferUpdater(dispatch, { id }), [dispatch, id]);
}

export function useInitRequestBuffer(id: EntityId) {
  const dispatch = useApiClientDispatch();
  const { record, buffer } = useRequestData(id);

  useEffect(() => {
    if (record && !buffer) {
      dispatch(
        buffersActions.initBuffer({
          id,
          entityType: "request",
          data: record,
        })
      );
    }
  }, [id, record, buffer, dispatch]);
}

export function useHttpRequestRecord(id: EntityId) {
  const record = useRequestRecord(id);
  const updater = useHttpRequestUpdater(id);
  return { record, updater };
}

export function useHttpRequestBuffer(id: EntityId) {
  const buffer = useRequestBuffer(id);
  const updater = useHttpRequestBufferUpdater(id);
  useInitRequestBuffer(id);
  return { buffer, updater };
}

export function useGraphQLRequestRecord(id: EntityId) {
  const record = useRequestRecord(id);
  const updater = useGraphQLRequestUpdater(id);
  return { record, updater };
}

export function useGraphQLRequestBuffer(id: EntityId) {
  const buffer = useRequestBuffer(id);
  const updater = useGraphQLRequestBufferUpdater(id);
  useInitRequestBuffer(id);
  return { buffer, updater };
}

export function useHttpRequest(id: EntityId) {
  const { record, buffer } = useRequestData(id);
  const recordUpdater = useHttpRequestUpdater(id);
  const bufferUpdater = useHttpRequestBufferUpdater(id);
  useInitRequestBuffer(id);

  return { record, buffer, recordUpdater, bufferUpdater };
}

export function useGraphQLRequest(id: EntityId) {
  const { record, buffer } = useRequestData(id);
  const recordUpdater = useGraphQLRequestUpdater(id);
  const bufferUpdater = useGraphQLRequestBufferUpdater(id);
  useInitRequestBuffer(id);

  return { record, buffer, recordUpdater, bufferUpdater };
}

export function useRequest(id: EntityId) {
  const { record, buffer } = useRequestData(id);
  const isGraphQL = record?.data?.type === RQAPI.ApiEntryType.GRAPHQL;

  const httpRecordUpdater = useHttpRequestUpdater(id);
  const httpBufferUpdater = useHttpRequestBufferUpdater(id);
  const graphqlRecordUpdater = useGraphQLRequestUpdater(id);
  const graphqlBufferUpdater = useGraphQLRequestBufferUpdater(id);

  useInitRequestBuffer(id);

  return {
    record,
    buffer,
    recordUpdater: isGraphQL ? graphqlRecordUpdater : httpRecordUpdater,
    bufferUpdater: isGraphQL ? graphqlBufferUpdater : httpBufferUpdater,
    isGraphQL,
  };
}
