import { ApiClientEntityType } from "../types";
import type { EntityDispatch } from "../types";
import { BufferedHttpRecordEntity } from "./http";
import { BufferedGraphQLRecordEntity } from "./graphql";
import { BufferedEnvironmentEntity, BufferedGlobalEnvironmentEntity } from "./environment";
import { BufferedRuntimeVariablesEntity } from "./runtime-variables";
import { BufferedCollectionRecordEntity } from "./collection";
import type { ApiClientEntity, ApiClientEntityMeta } from "../base";

export type BufferedApiClientEntityMeta = ApiClientEntityMeta & ({originExists: true, referenceId: string} | {originExists: false});
export interface BufferedApiClientEntity {
  meta: BufferedApiClientEntityMeta,
  origin: ApiClientEntity<any, any, any>
};

export type OriginExists<T extends BufferedApiClientEntity> = T & {meta: {originExists: true}};
export type OriginUndfined<T extends BufferedApiClientEntity> = T & {meta: {originExists: false}};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BufferedEntityFactory {
  export type EntityTypeMap<T extends ApiClientEntityType> = T extends ApiClientEntityType.HTTP_RECORD
    ? BufferedHttpRecordEntity
    : T extends ApiClientEntityType.GRAPHQL_RECORD
    ? BufferedGraphQLRecordEntity
    : T extends ApiClientEntityType.ENVIRONMENT
    ? BufferedEnvironmentEntity
    : T extends ApiClientEntityType.GLOBAL_ENVIRONMENT
    ? BufferedGlobalEnvironmentEntity
    : T extends ApiClientEntityType.RUNTIME_VARIABLES
    ? BufferedRuntimeVariablesEntity
    : T extends ApiClientEntityType.COLLECTION_RECORD
    ? BufferedCollectionRecordEntity
    : never;

  export function from<T extends ApiClientEntityType>(
    params: { id: string; type: T, referenceId: string, },
    dispatch: EntityDispatch
  ): EntityTypeMap<T> {
    const meta: BufferedApiClientEntityMeta = { id: params.id, originExists: true, referenceId: params.referenceId };

    const entity = (() => {
      switch (params.type) {
        case ApiClientEntityType.HTTP_RECORD:
          return new BufferedHttpRecordEntity(dispatch, meta);
        case ApiClientEntityType.GRAPHQL_RECORD:
          return new BufferedGraphQLRecordEntity(dispatch, meta);
        case ApiClientEntityType.ENVIRONMENT:
          return new BufferedEnvironmentEntity(dispatch, meta);
        case ApiClientEntityType.GLOBAL_ENVIRONMENT:
          return new BufferedGlobalEnvironmentEntity(dispatch, meta);
        case ApiClientEntityType.RUNTIME_VARIABLES:
          return new BufferedRuntimeVariablesEntity(dispatch, meta);
        case ApiClientEntityType.COLLECTION_RECORD:
          return new BufferedCollectionRecordEntity(dispatch, meta);
      }
    })() as EntityTypeMap<T>;

    return entity;
  }
}
