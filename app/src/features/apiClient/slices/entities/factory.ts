import { ApiClientEntityType, EntityDispatch } from "./types";
import { HttpRecordEntity } from "./http";
import { GraphQLRecordEntity } from "./graphql";
import type { ApiClientEntityMeta } from "./base";
import { CollectionRecordEntity } from "./collection";
import { EnvironmentEntity, GlobalEnvironmentEntity } from "./environment";
import { RuntimeVariablesEntity } from "./runtime-variables";
import { RunConfigEntity } from "./runConfig";
import { LiveRunResultEntity } from "./liveRunResult";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EntityFactory {
  export type EntityTypeMap<T extends ApiClientEntityType> = T extends ApiClientEntityType.HTTP_RECORD
    ? HttpRecordEntity
    : T extends ApiClientEntityType.COLLECTION_RECORD
    ? CollectionRecordEntity
    : T extends ApiClientEntityType.ENVIRONMENT
    ? EnvironmentEntity
    : T extends ApiClientEntityType.GLOBAL_ENVIRONMENT
    ? GlobalEnvironmentEntity
    : T extends ApiClientEntityType.RUNTIME_VARIABLES
    ? RuntimeVariablesEntity
    : T extends ApiClientEntityType.RUN_CONFIG
    ? RunConfigEntity
    : T extends ApiClientEntityType.LIVE_RUN_RESULT
    ? LiveRunResultEntity
    : GraphQLRecordEntity;

  export const GlobalStateOverrideConfig: {
    [key in ApiClientEntityType]?: boolean;
  } = {
    [ApiClientEntityType.RUNTIME_VARIABLES]: true,
  };

  export function from<T extends ApiClientEntityType>(
    params: { id: string; type: T },
    dispatch: EntityDispatch
  ): EntityTypeMap<T> {
    const meta: ApiClientEntityMeta = { id: params.id };

    const entity = (() => {
      switch (params.type) {
        case ApiClientEntityType.HTTP_RECORD:
          return new HttpRecordEntity(dispatch, meta);
        case ApiClientEntityType.COLLECTION_RECORD:
          return new CollectionRecordEntity(dispatch, meta);
        case ApiClientEntityType.GRAPHQL_RECORD:
          return new GraphQLRecordEntity(dispatch, meta);
        case ApiClientEntityType.ENVIRONMENT:
          return new EnvironmentEntity(dispatch, meta);
        case ApiClientEntityType.GLOBAL_ENVIRONMENT:
          return new GlobalEnvironmentEntity(dispatch);
        case ApiClientEntityType.RUNTIME_VARIABLES:
          return new RuntimeVariablesEntity(dispatch);
        case ApiClientEntityType.RUN_CONFIG:
          return new RunConfigEntity(dispatch, meta);
        case ApiClientEntityType.LIVE_RUN_RESULT:
          return new LiveRunResultEntity(dispatch, meta);
      }
    })() as EntityTypeMap<T>;

    return entity;
  }
}
