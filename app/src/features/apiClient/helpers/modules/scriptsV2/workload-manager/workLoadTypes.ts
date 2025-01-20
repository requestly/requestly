import {
  BaseSnapshot,
  SnapshotForPostResponse,
  SnapshotForPreRequest,
} from "features/apiClient/helpers/requestExecutor/snapshot";

export type SyncLocalDumpCallback = (state: any) => Promise<void>;

export interface ScriptWorkload<T extends BaseSnapshot = BaseSnapshot> {
  readonly script: string;
  readonly initialState: T;
  readonly postScriptExecutionCallback: SyncLocalDumpCallback;
}

export class PreRequestScriptWorkload implements ScriptWorkload<SnapshotForPreRequest> {
  constructor(
    readonly script: string,
    readonly initialState: SnapshotForPreRequest,
    readonly postScriptExecutionCallback: SyncLocalDumpCallback
  ) {}
}

export class PostResponseScriptWorkload implements ScriptWorkload<SnapshotForPostResponse> {
  constructor(
    readonly script: string,
    readonly initialState: SnapshotForPostResponse,
    readonly postScriptExecutionCallback: SyncLocalDumpCallback
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
  SCRIPT_EXECUTION_FAILED = "SCRIPT_EXECUTION_FAILED",
  SCRIPT_PENDING_WORK_FLUSHING_FAILED = "SCRIPT_PENDING_WORK_FLUSHING_FAILED",
  EXECUTION_ABORTED = "EXECUTION_ABORTED",
}

export type WorkError = {
  type: WorkErrorType;
} & (
  | {
      type: WorkErrorType.SCRIPT_EXECUTION_FAILED;
      message: string;
      name: string;
    }
  | {
      type: WorkErrorType.SCRIPT_PENDING_WORK_FLUSHING_FAILED;
      message: string;
      name: string;
    }
  | {
      type: WorkErrorType.EXECUTION_ABORTED;
      message: string;
      name: string;
    }
);
