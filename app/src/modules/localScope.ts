import { ExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";

export type LocalScopeInitialState = Pick<
  ExecutionContext,
  "collectionVariables" | "environment" | "global" | "request" | "response" | "variables"
>;

export class LocalScope {
  private state: LocalScopeInitialState;
  private isStateMutated: boolean;

  constructor(initialState: LocalScopeInitialState) {
    this.state = { ...initialState };
    this.isStateMutated = false;
  }

  public set(key: keyof LocalScopeInitialState, value: any): void {
    if (!key) {
      throw new Error("Key cannot be empty");
    }
    if (!this.isStateMutated) {
      this.isStateMutated = true;
    }

    this.state[key] = value;
  }

  public get(key: keyof LocalScopeInitialState): any {
    return this.state[key];
  }

  public getAll(): any {
    return this.state;
  }

  public getIsStateMutated(): boolean {
    return this.isStateMutated;
  }
}
