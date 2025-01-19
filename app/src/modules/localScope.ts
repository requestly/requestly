import { StateUpdateCallback } from "features/apiClient/helpers/modules/scriptsV2/workload-manager/workLoadTypes";

export class LocalScope {
  private pendingCallbackExecutions: Promise<any>[] = [];
  private state: any;
  private callback: StateUpdateCallback;

  constructor(initialState: any, callback: StateUpdateCallback) {
    this.state = { ...initialState };
    this.callback = callback;
  }

  public set(key: string, value: any): void {
    if (!key) {
      throw new Error("Key cannot be empty");
    }

    this.state[key] = value;
    const pendingCallbackExecution = this.callback(key, value);
    this.pendingCallbackExecutions.push(pendingCallbackExecution);
  }

  public get(key: string): any {
    return this.state[key];
  }

  public getAll(): any {
    return this.state;
  }

  public getPendingCallbackExecutions() {
    return this.pendingCallbackExecutions;
  }
}
