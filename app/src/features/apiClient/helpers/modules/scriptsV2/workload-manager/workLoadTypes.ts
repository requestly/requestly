export type StateUpdateCallback = (key: string, value: any) => Promise<void>;

export interface ScriptWorkload {
  readonly script: string;
  readonly initialState: any;
  readonly onStateUpdate: StateUpdateCallback;
}

export class PreRequestScriptWorkload implements ScriptWorkload {
  constructor(readonly script: string, readonly initialState: any, readonly onStateUpdate: StateUpdateCallback) {}
}

export class PostResponseScriptWorkload implements ScriptWorkload {
  constructor(readonly script: string, readonly initialState: any, readonly onStateUpdate: StateUpdateCallback) {}
}

export enum WorkResultType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type WorkResult = {
  type: WorkResultType;
} & (
  | {
      type: WorkResultType.SUCCESS;
    }
  | {
      type: WorkResultType.ERROR;
      error: WorkError;
    }
);

export enum WorkErrorType {
  UNEXPECTED = "UNEXPECTED",
}

export type WorkError = {
  type: WorkErrorType;
} & {
  type: WorkErrorType.UNEXPECTED;
  message: string;
  name: string;
};
