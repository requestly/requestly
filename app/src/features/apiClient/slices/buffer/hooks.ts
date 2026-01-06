import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ApiClientEntity } from "../entities";
import { ApiClientStore, ApiClientStoreState, useApiClientRepository, useApiClientStore } from "../workspaceView/helpers/ApiClientContextRegistry";
import { Try } from "utils/try";
import { useMemo } from "react";
import { Dispatch } from "@reduxjs/toolkit";
import { bufferActions, bufferAdapterSelectors } from "./slice";
import { BufferedApiClientEntity, OriginExists } from "../entities/buffered/factory";
import { EntityNotFound } from "../types";
import { useApiClientDispatch } from '../hooks/base.hooks';


function createSave(
  repositories: ApiClientRepositoryInterface,
  store: ApiClientStore,
  dispatch: Dispatch,
) {
  async function save<T extends BufferedApiClientEntity, C extends T extends ApiClientEntity<infer K> ? K : never = T extends ApiClientEntity<infer K> ? K : never>(
    params: {
      entity: T,
      produceChanges?: (entity: T, state: ApiClientStoreState) => C,
      save: (changes: C, repositories: ApiClientRepositoryInterface, entity: T) => T extends OriginExists<BufferedApiClientEntity> ? Promise<void> : Promise<C & { id: string }>,
    },
    hooks: {
      onError?: (e: Error) => void,
      onSuccess?: (changes: C, entity: T) => void,
      beforeSave?: () => void,
      afterSave?: () => void,
    } = {},
  ) {
    const {
      onSuccess = () => { },
      onError = () => { },
    } = hooks;
    const state = store.getState();
    try {
      const buffer = bufferAdapterSelectors.selectById(state.buffer, params.entity.meta.id);
      if (!buffer) {
        throw new EntityNotFound(params.entity.meta.id, "buffer");
      }
      const changes = params.produceChanges?.(params.entity, state) || buffer.current as C;
      hooks.beforeSave?.();
      const result = await Try(() => params.save(changes, repositories, params.entity));
      result
        .inspectError(onError)
        .inspectError(() => {
          hooks.afterSave?.();
        })
        .inspect((savedEntity) => {
          hooks.afterSave?.();
          params.entity.origin.upsert(savedEntity || changes);
          dispatch(
            bufferActions.markSaved({
              id: params.entity.meta.id,
              referenceId: savedEntity?.id,
              savedData: savedEntity,
            })
          );
          onSuccess(changes, params.entity)
        }
        );
      return result;
    }
    catch (e) {
      hooks.afterSave?.();
      onError(e);
    }
  }
  return save
};

// t0: click save, e=s1, b=s2
// t2: daemon updates e, e=s3, b=s2
// t3: mark saved, e=s3, b=s2
// t3: find entity and replace, e=s2, b=s2

export function useSaveBuffer() {
  const repositories = useApiClientRepository();
  const store = useApiClientStore();
  const dispatch = useApiClientDispatch();
  const save = useMemo(() => createSave(repositories, store, dispatch), [repositories, store, dispatch]);

  return save;
}
