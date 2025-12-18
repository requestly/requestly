import { useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useApiClientDispatch, useApiClientSelector } from "../hooks/base.hooks";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientEntityType } from "./types";
import { EntityFactory } from "./factory";
import { HttpRecordEntity } from "./http";
import { GraphQLRecordEntity } from "./graphql";

export function useEntity<T extends ApiClientEntityType>(params: { id: string; type: T }) {
  const dispatch = useApiClientDispatch();
  const entity = EntityFactory.from(params, dispatch);
  return useMemo(() => entity, [entity]);
}

export function useEntitySelector<T extends ApiClientEntityType, R>(
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
