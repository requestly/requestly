import { useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useApiClientDispatch, useApiClientSelector } from "../hooks/base.hooks";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import type { ApiClientRootState } from "../hooks/types";
import { ApiClientEntityType } from "./types";
import { EntityFactory } from "./factory";
import type { HttpRecordEntity } from "./http";
import type { GraphQLRecordEntity } from "./graphql";
import { BufferedEntityFactory, OriginExists, OriginUndfined } from "./buffered/factory";
import type { BufferedHttpRecordEntity } from "./buffered/http";
import type { BufferedGraphQLRecordEntity } from "./buffered/graphql";
import type { BufferedRuntimeVariablesEntity } from "./buffered/runtime-variables";
import type { BufferedCollectionRecordEntity } from "./buffered/collection";
import { useDispatch } from "react-redux";
import { bufferAdapterSelectors, findBufferByReferenceId } from "../buffer/slice";
import { EntityNotFound } from "../types";
import { RUNTIME_VARIABLES_ENTITY_ID } from "../common/constants";

export function useEntity<T extends ApiClientEntityType>(params: { id: string; type: T }) {
  const dispatch = EntityFactory.GlobalStateOverrideConfig[params.type] ? useDispatch() : useApiClientDispatch();
  return useMemo(
    () => EntityFactory.from(params, dispatch),
    [params.id, params.type, dispatch]
  );
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
  const buffer = useApiClientSelector((s) => findBufferByReferenceId(s.buffer.entities, params.id));
  if (!buffer) {
    throw new EntityNotFound(params.id, params.type);
  }
  const entity = BufferedEntityFactory.from(
    {
      id: buffer.id,
      type: params.type,
      referenceId: params.id,
    },
    dispatch
  ) as OriginExists<BufferedEntityFactory.EntityTypeMap<T>>;
  return useMemo(() => entity, [entity]);
}

export function useOriginUndefinedBufferedEntity<T extends ApiClientEntityType>(params: { bufferId: string }) {
  const dispatch = useApiClientDispatch();
  const buffer = useApiClientSelector((s) => bufferAdapterSelectors.selectById(s.buffer, params.bufferId));
  if (!buffer) {
    throw new EntityNotFound(params.bufferId, "buffer");
  }
  const entity = BufferedEntityFactory.from(
    {
      id: buffer.id,
      type: buffer.entityType as T,
      referenceId: "FAKE_ID",
    },
    dispatch
  ) as OriginUndfined<BufferedEntityFactory.EntityTypeMap<T>>;
  entity.meta.originExists = false;
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

export function useBufferByReferenceId(referenceId: string) {
  const buffer = useApiClientSelector((state) => findBufferByReferenceId(state.buffer.entities, referenceId));
  if (!buffer) {
    throw new EntityNotFound(referenceId, "BUFFER" as ApiClientEntityType);
  }
  return buffer;
}

export function useBufferByBufferId(bufferId: string) {
  const buffer = useApiClientSelector((state) => bufferAdapterSelectors.selectById(state.buffer, bufferId));
  if (!buffer) {
    throw new EntityNotFound(bufferId, "BUFFER" as ApiClientEntityType);
  }
  return buffer;
}

export function useIsBufferDirty(
  params:
    | {
        type: "referenceId";
        referenceId: string;
      }
    | {
        type: "bufferId";
        bufferId: string;
      }
): boolean {
  return useApiClientSelector((state) => {
    const entry =
      params.type === "referenceId"
        ? findBufferByReferenceId(state.buffer.entities, params.referenceId)
        : bufferAdapterSelectors.selectById(state.buffer, params.bufferId);
    return entry?.isDirty ?? false;
  });
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

export function useEnvironmentEntity(
  id: string,
  type: ApiClientEntityType.ENVIRONMENT | ApiClientEntityType.GLOBAL_ENVIRONMENT
) {
  return useEntity({
    id,
    type,
  });
}

export function useBufferedEnvironmentEntity(id: string, isGlobal: boolean) {
  return useBufferedEntity({
    id,
    type: isGlobal ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT,
  });
}

export function useBufferedRuntimeVariablesEntity(): OriginExists<BufferedRuntimeVariablesEntity> {
  return useBufferedEntity({
    id: RUNTIME_VARIABLES_ENTITY_ID,
    type: ApiClientEntityType.RUNTIME_VARIABLES,
  });
}

export function useBufferedCollectionEntity(id: string): OriginExists<BufferedCollectionRecordEntity> {
  return useBufferedEntity({ id, type: ApiClientEntityType.COLLECTION_RECORD });
}

export function useRunConfigEntity(collectionId: string, configId: string) {
  const id = `${collectionId}::${configId}`;
  return useEntity({ id, type: ApiClientEntityType.RUN_CONFIG });
}

export function useBufferedRunConfigEntity(collectionId: string, configId: string) {
  const id = `${collectionId}::${configId}`;
  return useBufferedEntity({ id, type: ApiClientEntityType.RUN_CONFIG });
}
