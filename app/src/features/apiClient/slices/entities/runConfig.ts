import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import { runnerConfigActions, runConfigAdapter } from "../runConfig/slice";
import type { EntityState } from "@reduxjs/toolkit";
import {
   RunConfigEntity as RunConfigRecord,
   RunOrder,
   RunDataFile,
  parseRunnerConfigKey,
} from "../runConfig/types";

// Extended state type to include runnerConfig slice
type ApiClientStateWithRunConfig = ApiClientStoreState & {
  runnerConfig: {
    configs: EntityState<RunConfigRecord>;
  };
};

/**
 * Entity class for RunConfig with composite key (collectionId::configId).
 * Provides typed methods for updating run configuration settings.
 */
export class RunConfigEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  RunConfigRecord,
  M
> {
  dispatchCommand(command: UpdateCommand<RunConfigRecord>): void {
    throw new Error("Method not implemented.");
  }
  readonly type = ApiClientEntityType.RUN_CONFIG;

  // Parsed composite key parts (lazy-loaded)
  private _collectionId?: string;
  private _configId?: string;

  /**
   * Get the collection ID from the composite key
   */
  get collectionId(): string {
    if (!this._collectionId) {
      const parsed = parseRunnerConfigKey(this.id);
      this._collectionId = parsed.collectionId;
      this._configId = parsed.configId;
    }
    return this._collectionId;
  }

  /**
   * Get the config ID from the composite key
   */
  get configId(): string {
    if (!this._configId) {
      const parsed = parseRunnerConfigKey(this.id);
      this._collectionId = parsed.collectionId;
      this._configId = parsed.configId;
    }
    return this._configId;
  }

  upsert(params: RunConfigRecord): void {
    this.dispatch(runnerConfigActions.upsertConfig(params));
  }

  getName(state: ApiClientStoreState): string {
    return `Run Config: ${this.configId}`;
  }

  getEntityFromState(state: ApiClientStoreState): RunConfigRecord {
    // Type assertion needed as runnerConfig slice is not yet in ApiClientStoreState type
    const stateWithRunConfig = state as ApiClientStateWithRunConfig;
    const runConfigState = stateWithRunConfig.runnerConfig;
    if (!runConfigState) {
      throw new EntityNotFound(this.id, "runnerConfig state");
    }

    const config = runConfigAdapter.getSelectors().selectById(runConfigState.configs, this.id);
    if (!config) {
      throw new EntityNotFound(this.id, "run_config");
    }
    return config;
  }

  dispatchUnsafePatch(patcher: (config: RunConfigRecord) => void): void {
    // RunConfig doesn't use unsafe patch pattern currently
    // Individual setters dispatch specific actions instead
    throw new Error("unsafePatch not supported for RunConfigEntity. Use specific setters instead.");
  }

  // ========================================
  // Typed Setters
  // ========================================

  /**
   * Update the run order (list of requests with selection state)
   */
  setRunOrder(runOrder: RunOrder): void {
    this.dispatch(runnerConfigActions.updateRunOrder(this.collectionId, this.configId, runOrder));
  }

  /**
   * Update the delay between requests (in milliseconds)
   */
  setDelay(delay: number): void {
    this.dispatch(runnerConfigActions.updateDelay(this.collectionId, this.configId, delay));
  }

  /**
   * Update the number of iterations
   */
  setIterations(iterations: number): void {
    this.dispatch(runnerConfigActions.updateIterations(this.collectionId, this.configId, iterations));
  }

  /**
   * Update the data file configuration
   */
  setDataFile(dataFile: RunDataFile | null): void {
    this.dispatch(runnerConfigActions.updateDataFile(this.collectionId, this.configId, dataFile));
  }

  /**
   * Toggle selection state for a specific request
   */
  toggleRequestSelection(requestId: string): void {
    this.dispatch(runnerConfigActions.toggleRequestSelection(this.collectionId, this.configId, requestId));
  }

  /**
   * Set selection state for a specific request
   */
  setRequestSelection(requestId: string, isSelected: boolean): void {
    this.dispatch(runnerConfigActions.setRequestSelection(this.collectionId, this.configId, requestId, isSelected));
  }

  /**
   * Toggle all requests to a specific selection state
   */
  toggleAllSelections(isSelected: boolean): void {
    this.dispatch(runnerConfigActions.toggleAllSelections(this.collectionId, this.configId, isSelected));
  }

  /**
   * Delete this run config from the store
   */
  delete(): void {
    this.dispatch(runnerConfigActions.removeConfig(this.id));
  }

  // ========================================
  // Convenience Getters
  // ========================================

  /**
   * Get the run order from state
   */
  getRunOrder(state: ApiClientStoreState): RunOrder {
    return this.getEntityFromState(state).runOrder;
  }

  /**
   * Get the delay from state
   */
  getDelay(state: ApiClientStoreState): number {
    return this.getEntityFromState(state).delay;
  }

  /**
   * Get the iterations from state
   */
  getIterations(state: ApiClientStoreState): number {
    return this.getEntityFromState(state).iterations;
  }

  /**
   * Get the data file from state
   */
  getDataFile(state: ApiClientStoreState): RunDataFile | null {
    return this.getEntityFromState(state).dataFile;
  }

  /**
   * Get selected request IDs
   */
  getSelectedRequestIds(state: ApiClientStoreState): string[] {
    return this.getRunOrder(state)
      .filter((item) => item.isSelected)
      .map((item) => item.id);
  }

  /**
   * Check if all requests are selected
   */
  areAllRequestsSelected(state: ApiClientStoreState): boolean {
    const runOrder = this.getRunOrder(state);
    return runOrder.length > 0 && runOrder.every((item) => item.isSelected);
  }

  /**
   * Check if any requests are selected
   */
  hasAnySelectedRequests(state: ApiClientStoreState): boolean {
    return this.getRunOrder(state).some((item) => item.isSelected);
  }
}
