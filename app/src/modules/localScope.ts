export class LocalScope {
  private state: any;
  private isStateMutated: boolean;

  constructor(initialState: any) {
    this.state = { ...initialState };
    this.isStateMutated = false;
  }

  public set(key: string, value: any): void {
    if (!key) {
      throw new Error("Key cannot be empty");
    }
    if (!this.isStateMutated) {
      this.isStateMutated = true;
    }

    this.state[key] = value;
  }

  public get(key: string): any {
    return this.state[key];
  }

  public getAll(): any {
    return this.state;
  }

  public getIsStateMutated(): boolean {
    return this.isStateMutated;
  }
}
