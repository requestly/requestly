import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import { runnerConfigActions, runConfigAdapter } from "../runConfig/slice";
import { RunConfigEntity as RunConfigRecord, RunOrder, RunDataFile } from "../runConfig/types";
import { apiClientFileStore } from "features/apiClient/store/apiClientFilesStore";

export class RunConfigEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<
  RunConfigRecord,
  M
> {
  readonly type = ApiClientEntityType.RUN_CONFIG;

  dispatchCommand(command: UpdateCommand<RunConfigRecord>): void {
    throw new Error("RunConfigEntity does not support dispatchCommand. Use unsafePatch instead.");
  }

  upsert(params: RunConfigRecord): void {
    this.dispatch(runnerConfigActions.upsertConfig(params));
  }

  getName(): string {
    return "runner";
  }

  getEntityFromState(state: ApiClientStoreState): RunConfigRecord {
    const runConfigState = state.runConfig;
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
    this.dispatch(
      runnerConfigActions.unsafePatch({
        id: this.id,
        patcher,
      })
    );
  }

  unsafePatch(patcher: (config: RunConfigRecord) => void): void {
    this.dispatchUnsafePatch(patcher);
  }

  setRunOrder(runOrder: RunOrder): void {
    this.unsafePatch((config) => {
      config.runOrder = runOrder;
    });
  }

  setDelay(delay: number): void {
    this.unsafePatch((config) => {
      config.delay = delay;
    });
  }

  setIterations(iterations: number): void {
    this.unsafePatch((config) => {
      config.iterations = iterations;
    });
  }

  setDataFile(dataFile: RunDataFile | null): void {
    this.unsafePatch((config) => {
      config.dataFile = dataFile;
    });
  }

  removeDataFile(): void {
    this.unsafePatch((config) => {
      if (!config.dataFile) return;
      apiClientFileStore.getState().removeFile(config.dataFile.id);
      config.dataFile = null;
    });
  }

  toggleRequestSelection(requestId: string): void {
    this.unsafePatch((config) => {
      config.runOrder = config.runOrder.map((item) =>
        item.id === requestId ? { ...item, isSelected: !item.isSelected } : item
      );
    });
  }

  setRequestSelection(requestId: string, isSelected: boolean): void {
    this.unsafePatch((config) => {
      config.runOrder = config.runOrder.map((item) => (item.id === requestId ? { ...item, isSelected } : item));
    });
  }

  toggleAllSelections(isSelected: boolean): void {
    this.unsafePatch((config) => {
      config.runOrder = config.runOrder.map((item) => ({
        ...item,
        isSelected,
      }));
    });
  }

  delete(): void {
    this.dispatch(runnerConfigActions.removeConfig(this.id));
  }

  getRunOrder(state: ApiClientStoreState): RunOrder {
    return this.getEntityFromState(state).runOrder;
  }

  getDelay(state: ApiClientStoreState): number {
    return this.getEntityFromState(state).delay;
  }

  getIterations(state: ApiClientStoreState): number {
    return this.getEntityFromState(state).iterations;
  }

  getDataFile(state: ApiClientStoreState): RunDataFile | null {
    return this.getEntityFromState(state).dataFile;
  }

  getSelectedRequestIds(state: ApiClientStoreState): string[] {
    return this.getRunOrder(state)
      .filter((item) => item.isSelected)
      .map((item) => item.id);
  }

  areAllRequestsSelected(state: ApiClientStoreState): boolean {
    const runOrder = this.getRunOrder(state);
    return runOrder.length > 0 && runOrder.every((item) => item.isSelected);
  }

  hasAnySelectedRequests(state: ApiClientStoreState): boolean {
    return this.getRunOrder(state).some((item) => item.isSelected);
  }
}
