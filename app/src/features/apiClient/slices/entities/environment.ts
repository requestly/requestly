import { Dispatch } from "@reduxjs/toolkit";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientVariables } from "./api-client-variables";
import { EnvironmentEntity as EnvironmentRecord } from "../environments/types";
import { selectEnvironmentById, selectGlobalEnvironment } from "../environments/selectors";
import { environmentsActions } from "../environments/slice";
import { EntityNotFound } from "../types";
import { ApiClientEntityType, EntityDispatch } from "./types";
import { GLOBAL_ENVIRONMENT_ID } from "../common/constants";



export type EnvironmentEntityMeta = {
  id: string;
};

/**
 * Abstract base class for environment entities.
 * Similar to ApiClientEntity but without SET/DELETE command pattern
 * since environments are homogeneous and don't need applyPatch.
 */
export abstract class ApiClientEnvironmentEntity<
  M extends EnvironmentEntityMeta = EnvironmentEntityMeta
> {
  abstract readonly type: ApiClientEntityType;
  abstract readonly variables: ApiClientVariables<EnvironmentRecord>;

  constructor(
    protected readonly dispatch: EntityDispatch,
    public readonly meta: M
  ) {}

  get id(): string {
    return this.meta.id;
  }

  /**
   * Get the environment entity from the store state.
   * Must be implemented by concrete classes.
   */
  abstract getEntityFromState(state: ApiClientStoreState): EnvironmentRecord;

  /**
   * Dispatch an unsafe patch action.
   * Must be implemented by concrete classes as they dispatch different actions.
   */
  abstract dispatchUnsafePatch(patcher: (env: EnvironmentRecord) => void): void;

  /**
   * Mutate the environment entity directly via unsafe patch.
   * Delegates to dispatchUnsafePatch.
   */
  unsafePatch(patcher: (env: EnvironmentRecord) => void): void {
    this.dispatchUnsafePatch(patcher);
  }


  getName(state: ApiClientStoreState): string {
    return this.getEntityFromState(state).name;
  }

}

/**
 * Entity class for regular (non-global) environments.
 * Supports full CRUD operations including delete.
 */
export class EnvironmentEntity extends ApiClientEnvironmentEntity {
  readonly type = ApiClientEntityType.ENVIRONMENT;

  public readonly variables = new ApiClientVariables<EnvironmentRecord>(
    (e) => e.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );



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
  update(changes: Partial<Omit<EnvironmentRecord, "id" | "variables">>): void {
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
   */
  setAsActive(): void {
    this.dispatch(environmentsActions.setActiveEnvironment(this.id));
  }
}

/**
 * Entity class for the global environment.
 * Has limited operations compared to regular environments (no delete, no set as active).
 */
export class GlobalEnvironmentEntity extends ApiClientEnvironmentEntity {
  readonly type = ApiClientEntityType.GLOBAL_ENVIRONMENT;

  public readonly variables = new ApiClientVariables<EnvironmentRecord>(
    (e) => e.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  constructor(dispatch: Dispatch) {
      super(dispatch, {
        id: GLOBAL_ENVIRONMENT_ID,
      });
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
