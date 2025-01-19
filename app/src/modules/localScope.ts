export type StateUpdateCallback = (key: string, value: any) => void;

export class LocalScope {
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
    this.callback(key, value);
  }

  public get(key: string): any {
    return this.state[key];
  }

  public getAll(): any {
    return this.state;
  }
}
