import { ApiClientEntityType, EntityDispatch } from "./types";
import { HttpRecordEntity } from "./http";
import { GraphQLRecordEntity } from "./graphql";
import { ApiClientEntityMeta } from "./base";
import { CollectionRecordEntity } from "./collection";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EntityFactory {
  export type EntityTypeMap<T extends ApiClientEntityType> = T extends ApiClientEntityType.HTTP_RECORD ? HttpRecordEntity :  T extends ApiClientEntityType.COLLECTION_RECORD ? CollectionRecordEntity :  GraphQLRecordEntity;


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
      }
    })() as EntityTypeMap<T>;

    return entity;
  }
}
