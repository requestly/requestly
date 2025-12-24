import { useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useApiClientDispatch, useApiClientSelector } from "../hooks/base.hooks";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRootState } from "../hooks/types";
import { ApiClientEntityType } from "./types";
import { EntityFactory } from "./factory";
import { HttpRecordEntity } from "./http";
import { GraphQLRecordEntity } from "./graphql";
import { BufferedEntityFactory } from "./buffered/factory";
import { BufferedHttpRecordEntity } from "./buffered/http";
import { BufferedGraphQLRecordEntity } from "./buffered/graphql";
import { useDispatch } from "react-redux";
import { bufferAdapterSelectors, findBufferByReferenceId } from "../buffer/slice";

export function useEntity<T extends ApiClientEntityType>(params: { id: string; type: T }) {
  const dispatch = EntityFactory.GlobalStateOverrideConfig[params.type] ? useDispatch() : useApiClientDispatch();
  const entity = EntityFactory.from(params, dispatch);
  return useMemo(() => entity, [entity]);
}

export function useEntitySelector<T extends Exclude<ApiClientEntityType, ApiClientEntityType.RUNTIME_VARIABLES>, R>(
  params: { id: string; type: T },
  selector: (entity: EntityFactory.EntityTypeMap<T>, state: ApiClientStoreState) => R
): R {
  const entity = useEntity(params);

  const memoizedSelector = useMemo(
    () =>
      createSelector(
        (state: ApiClientStoreState) => state,
        (state) => selector(entity, state)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.id, params.type]
  );

  return useApiClientSelector(memoizedSelector);
}

export function useHttpRecordEntity(id: string): HttpRecordEntity {
  return useEntity({ id, type: ApiClientEntityType.HTTP_RECORD });
}

export function useGraphQLRecordEntity(id: string): GraphQLRecordEntity {
  return useEntity({ id, type: ApiClientEntityType.GRAPHQL_RECORD });
}

export function useBufferedEntity<T extends ApiClientEntityType>(params: { id: string; type: T }) {
  const dispatch = useApiClientDispatch();
  const buffer = useApiClientSelector((s) => findBufferByReferenceId(s.buffer.entities, params.id))!;
  const entity = BufferedEntityFactory.from(
    {
      id: buffer.id,
      type: params.type,
    },
    dispatch
  );
  return useMemo(() => entity, [entity]);
}

export function useBufferedEntitySelector<T extends ApiClientEntityType, R>(
  params: { id: string; type: T },
  selector: (entity: BufferedEntityFactory.EntityTypeMap<T>, state: ApiClientRootState) => R
): R {
  const entity = useBufferedEntity(params);

  const memoizedSelector = useMemo(
    () =>
      createSelector(
        (state: ApiClientRootState) => state,
        (state) => selector(entity, state)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.id, params.type]
  );

  return useApiClientSelector(memoizedSelector);
}

export function useBufferedHttpRecordEntity(id: string): BufferedHttpRecordEntity {
  return useBufferedEntity({ id, type: ApiClientEntityType.HTTP_RECORD });
}

export function useBufferedGraphQLRecordEntity(id: string): BufferedGraphQLRecordEntity {
  return useBufferedEntity({ id, type: ApiClientEntityType.GRAPHQL_RECORD });
}

export function useBufferEntry(id: string) {
  return useApiClientSelector((state) => bufferAdapterSelectors.selectById(state.buffer, id) ?? null);
}

export function useBufferIsDirty(id: string): boolean {
  return useApiClientSelector((state) => {
    const entry = bufferAdapterSelectors.selectById(state.buffer, id);
    return entry?.isDirty ?? false;
  });
}

export function useHasBuffer(id: string): boolean {
  return useApiClientSelector((state) => bufferAdapterSelectors.selectById(state.buffer, id) !== undefined);
}
