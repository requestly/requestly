import { ApiClientEntityType, EntityDispatch } from "../types";
import { BufferedHttpRecordEntity } from "./http";
import { BufferedGraphQLRecordEntity } from "./graphql";
import { ApiClientEntityMeta } from "../base";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BufferedEntityFactory {
  export type EntityTypeMap<T extends ApiClientEntityType> = T extends ApiClientEntityType.HTTP_RECORD
    ? BufferedHttpRecordEntity
    : BufferedGraphQLRecordEntity;

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
      }
    })() as EntityTypeMap<T>;

    return entity;
  }
}

