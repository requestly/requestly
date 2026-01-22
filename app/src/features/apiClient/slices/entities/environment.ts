import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientVariables } from "./api-client-variables";
import { EnvironmentEntity as EnvironmentRecord } from "../environments/types";
import { selectEnvironmentById, selectGlobalEnvironment } from "../environments/selectors";
import { environmentsActions } from "../environments/slice";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { GLOBAL_ENVIRONMENT_ID } from "../common/constants";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import { Dispatch } from "@reduxjs/toolkit";

/**
 * Entity class for regular (non-global) environments.
 * Supports full CRUD operations including delete.
 */
export class EnvironmentEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  EnvironmentRecord,
  M
> {
  dispatchCommand(command: UpdateCommand<EnvironmentRecord>): void {
    throw new Error("Method not implemented.");
  }
  readonly type = ApiClientEntityType.ENVIRONMENT;

  public readonly variables = new ApiClientVariables<EnvironmentRecord>(
    (e) => e.variables,
    (e) => e.variablesOrder,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  upsert(params: EnvironmentRecord): void {
    this.dispatch(environmentsActions.upsertEnvironment(params));
  }

  getName(state: ApiClientStoreState): string {
    return this.getEntityFromState(state).name;
  }

  getEntityFromState(state: ApiClientStoreState): EnvironmentRecord {
    const env = selectEnvironmentById(state, this.id);
    if (!env) {
      throw new EntityNotFound(this.id, "environment");
    }
    return env;
  }

  dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void {
    this.dispatch(
      environmentsActions.unsafePatch({
        id: this.id,
        patcher,
      })
    );
  }

  /**
   * Update environment properties via the slice action.
   * Preferred over unsafePatch for standard property updates.
   */
  private update(changes: Partial<Omit<EnvironmentRecord, "id" | "variables">>): void {
    this.dispatch(
      environmentsActions.environmentUpdated({
        id: this.id,
        changes,
      })
    );
  }

  /**
   * Update environment name via the slice action.
   */
  updateName(name: string): void {
    this.update({ name });
  }

  /**
   * Delete this environment from the store.
   */
  delete(): void {
    this.dispatch(environmentsActions.environmentDeleted(this.id));
  }

  /**
   * Set this environment as the active environment.
   * Note: This method dispatches directly to the Redux store, which is the standard
   * pattern for entity classes. The dispatch is handled by the entity's dispatch function.
   */
  setAsActive(): void {
    this.dispatch(environmentsActions.setActiveEnvironment(this.id));
  }
}

/**
 * Entity class for the global environment.
 * Has limited operations compared to regular environments (no delete, no set as active).
 */
export class GlobalEnvironmentEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  EnvironmentRecord,
  M
> {
  dispatchCommand(command: UpdateCommand<EnvironmentRecord>): void {
    throw new Error("Method not implemented.");
  }
  readonly type = ApiClientEntityType.GLOBAL_ENVIRONMENT;

  upsert(params: EnvironmentRecord): void {
    this.dispatch(environmentsActions.updateGlobalEnvironment(params));
  }

  getName(state: ApiClientStoreState): string {
    return this.getEntityFromState(state).name;
  }

  public readonly variables = new ApiClientVariables<EnvironmentRecord>(
    (e) => e.variables,
    (e) => e.variablesOrder,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  constructor(dispatch: Dispatch) {
    super(dispatch, {
      id: GLOBAL_ENVIRONMENT_ID,
    } as M);
  }

  getEntityFromState(state: ApiClientStoreState): EnvironmentRecord {
    const env = selectGlobalEnvironment(state);
    if (!env) {
      throw new EntityNotFound(this.id, GLOBAL_ENVIRONMENT_ID);
    }
    return env;
  }

  dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void {
    this.dispatch(
      environmentsActions.unsafePatchGlobal({
        patcher,
      })
    );
  }
}
