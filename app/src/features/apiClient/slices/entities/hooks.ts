import { useRef, useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useApiClientDispatch, useApiClientSelector } from "../hooks/base.hooks";
import { ApiClientRootState } from "../hooks/types";
import { EntityType } from "./types";
import { EntityFactory } from "./factory";
import { HttpRecordEntity } from "./http";
import { GraphQLRecordEntity } from "./graphql";

type EntityByType = {
  [EntityType.HTTP_RECORD]: HttpRecordEntity;
  [EntityType.GRAPHQL_RECORD]: GraphQLRecordEntity;
};

function useEntity<T extends EntityType>(params: { id: string; type: T }): EntityByType[T] {
  const dispatch = useApiClientDispatch();
  const entityRef = useRef<EntityByType[T] | null>(null);
  const keyRef = useRef("");

  const key = `${params.id}:${params.type}`;
  if (entityRef.current === null || keyRef.current !== key) {
    entityRef.current = EntityFactory.from(params, dispatch) as EntityByType[T];
    keyRef.current = key;
  }

  return entityRef.current;
}

export function useEntitySelector<T extends EntityType, R>(
  serialized: { id: string; type: T },
  selector: (entity: EntityByType[T], state: ApiClientRootState) => R
): R {
  const entity = useEntity(serialized);

  const memoizedSelector = useMemo(
    () =>
      createSelector(
        (state: ApiClientRootState) => state,
        (state) => selector(entity, state)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serialized.id, serialized.type]
  );

  return useApiClientSelector(memoizedSelector);
}

export function useHttpRecordEntity(id: string): HttpRecordEntity {
  return useEntity({ id, type: EntityType.HTTP_RECORD });
}

export function useGraphQLRecordEntity(id: string): GraphQLRecordEntity {
  return useEntity({ id, type: EntityType.GRAPHQL_RECORD });
}
