import { EntityType, EntityMeta, EntityDispatch, SerializedEntity } from "./types";
import { HttpRecordEntity } from "./http";
import { GraphQLRecordEntity } from "./graphql";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EntityFactory {
  export function from(
    params: { id: string; type: EntityType.HTTP_RECORD },
    dispatch: EntityDispatch
  ): HttpRecordEntity;
  export function from(
    params: { id: string; type: EntityType.GRAPHQL_RECORD },
    dispatch: EntityDispatch
  ): GraphQLRecordEntity;
  export function from(params: SerializedEntity, dispatch: EntityDispatch): HttpRecordEntity | GraphQLRecordEntity;

  export function from(
    params: { id: string; type: EntityType },
    dispatch: EntityDispatch
  ): HttpRecordEntity | GraphQLRecordEntity {
    const meta: EntityMeta = { id: params.id };

    switch (params.type) {
      case EntityType.HTTP_RECORD:
        return new HttpRecordEntity(dispatch, meta);
      case EntityType.GRAPHQL_RECORD:
        return new GraphQLRecordEntity(dispatch, meta);
      default: {
        const _exhaustive: never = params.type;
        throw new Error(`Unknown entity type: ${_exhaustive}`);
      }
    }
  }
}
