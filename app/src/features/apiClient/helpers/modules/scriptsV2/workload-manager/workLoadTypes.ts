import {
  BaseSnapshot,
  SnapshotForPostResponse,
  SnapshotForPreRequest,
} from "features/apiClient/helpers/requestExecutor/snapshot";

export type StateUpdateCallback = (key: string, value: any) => Promise<void>;

export interface ScriptWorkload<T extends BaseSnapshot = BaseSnapshot> {
  readonly script: string;
  readonly initialState: T;
  readonly onStateUpdate: StateUpdateCallback;
}

export class PreRequestScriptWorkload implements ScriptWorkload<SnapshotForPreRequest> {
  constructor(
    readonly script: string,
    readonly initialState: SnapshotForPreRequest,
    readonly onStateUpdate: StateUpdateCallback
  ) {}
}

export class PostResponseScriptWorkload implements ScriptWorkload<SnapshotForPostResponse> {
  constructor(
    readonly script: string,
    readonly initialState: SnapshotForPostResponse,
    readonly onStateUpdate: StateUpdateCallback
  ) {}
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
