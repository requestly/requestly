import { RootState } from "store/types";
import { ApiClientVariables } from "./api-client-variables";
import { RuntimeVariablesEntity as RuntimeVariablesRecord } from "../runtimeVariables/types";
import { selectRuntimeVariablesEntity } from "../runtimeVariables/selectors";
import { runtimeVariablesActions } from "../runtimeVariables/slice";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType, EntityDispatch } from "./types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";

const RUNTIME_VARIABLES_ENTITY_ID = "runtime_variables";

/**
 * Entity class for runtime variables.
 * Simple entity with just a variables property.
 * Uses the global Redux store instead of per-workspace API client store.
 */
export class RuntimeVariablesEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<RuntimeVariablesRecord, M, RootState> {
  readonly type = ApiClientEntityType.RUNTIME_VARIABLES;

  public readonly variables = new ApiClientVariables<RuntimeVariablesRecord, RootState>(
    (e) => e.variables,
    this.unsafePatch.bind(this),
    this.getEntityFromState.bind(this)
  );

  constructor(dispatch: EntityDispatch) {
    super(dispatch, { id: RUNTIME_VARIABLES_ENTITY_ID } as M);
  }

  dispatchCommand(_command: UpdateCommand<RuntimeVariablesRecord>): void {
    // Runtime variables don't use the SET/DELETE command pattern
    throw new Error("Runtime variables do not support dispatchCommand. Use unsafePatch instead.");
  }

  dispatchUnsafePatch(patcher: (entity: RuntimeVariablesRecord) => void): void {
    this.dispatch(
      runtimeVariablesActions.unsafePatch({
        patcher,
      })
    );
  }

  // Note: Uses RootState instead of ApiClientStoreState since runtime variables
  // are stored in the global Redux store
  getEntityFromState(state: RootState): RuntimeVariablesRecord {
    const entity = selectRuntimeVariablesEntity(state);
    if (!entity) {
      throw new EntityNotFound(this.id, "runtime_variables");
    }
    return entity;
  }

  getName(_state: RootState): string {
    return "Runtime Variables";
  }

  upsert(entity: RuntimeVariablesRecord): void {
    this.variables.refresh(entity.variables)
  }

  /**
   * Clear all runtime variables.
   */
  clear(): void {
    this.dispatch(runtimeVariablesActions.clear());
  }
}

