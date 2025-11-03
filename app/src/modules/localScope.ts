import {
  SnapshotForPostResponse,
  SnapshotForPreRequest,
} from "features/apiClient/helpers/httpRequestExecutor/snapshotTypes";

export type InitialState = SnapshotForPreRequest & {
  response?: SnapshotForPostResponse["response"];
};

export class LocalScope {
  private state: InitialState;
  private isStateMutated: boolean;

  constructor(initialState: InitialState) {
    this.state = { ...initialState };
    this.isStateMutated = false;
  }

  public set(key: keyof InitialState, value: any): void {
    if (!key) {
      throw new Error("Key cannot be empty");
    }
    if (!this.isStateMutated) {
      this.isStateMutated = true;
    }

    this.state[key] = value;
  }

  public get(key: keyof InitialState): any {
    return this.state[key];
  }

  public getAll(): any {
    return this.state;
  }

  public getIsStateMutated(): boolean {
    return this.isStateMutated;
  }
}
