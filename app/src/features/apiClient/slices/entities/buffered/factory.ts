import { ApiClientEntityType } from "../types";
import type { EntityDispatch } from "../types";
import { BufferedHttpRecordEntity } from "./http";
import { BufferedGraphQLRecordEntity } from "./graphql";
import { BufferedEnvironmentEntity, BufferedGlobalEnvironmentEntity } from "./environment";
import type { ApiClientEntityMeta } from "../base";

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
    : never;

  export function from<T extends ApiClientEntityType>(
    params: { id: string; type: T },
    dispatch: EntityDispatch
  ): EntityTypeMap<T> {
    const meta: ApiClientEntityMeta = { id: params.id };

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
      }
    })() as EntityTypeMap<T>;

    return entity;
  }
}
