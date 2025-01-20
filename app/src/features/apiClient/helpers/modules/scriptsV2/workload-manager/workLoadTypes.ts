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
  UNKNOWN = "UNKNOWN",
  SCRIPT_EXECUTION_FAILED = "SCRIPT_EXECUTION_FAILED",
  SCRIPT_PENDING_WORK_FLUSHING_FAILED = "SCRIPT_PENDING_WORK_FLUSHING_FAILED",
}

export type WorkError = {
  type: WorkErrorType;
  name: string;
} & (
  | {
      type: WorkErrorType.SCRIPT_EXECUTION_FAILED | WorkErrorType.UNKNOWN;
      message: string;
    }
  | {
      type: WorkErrorType.SCRIPT_PENDING_WORK_FLUSHING_FAILED;
      message: string;
    }
);

export class ScriptExecutionError extends Error {
  constructor(error: Error) {
    super(error.message);
    this.name = "ScriptExecutionError";
  }
}

export class ScriptPendingWorkFlushingError extends Error {
  constructor(error: Error) {
    super(error.message);
    this.name = "ScriptPendingWorkFlushingError";
  }
}
