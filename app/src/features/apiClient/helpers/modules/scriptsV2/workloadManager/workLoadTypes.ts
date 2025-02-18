import {
  BaseSnapshot,
  SnapshotForPostResponse,
  SnapshotForPreRequest,
} from "features/apiClient/helpers/apiClientExecutor/snapshotTypes";
import { TestResult } from "../worker/script-internals/types";

export type ScriptWorkloadCallback = (state: any) => Promise<void>;

export interface ScriptWorkload<T extends BaseSnapshot = BaseSnapshot> {
  readonly script: string;
  readonly initialState: T;
  readonly postScriptExecutionCallback: ScriptWorkloadCallback;
}

export class PreRequestScriptWorkload implements ScriptWorkload<SnapshotForPreRequest> {
  constructor(
    readonly script: string,
    readonly initialState: SnapshotForPreRequest,
    readonly postScriptExecutionCallback: ScriptWorkloadCallback
  ) {}
}

export class PostResponseScriptWorkload implements ScriptWorkload<SnapshotForPostResponse> {
  constructor(
    readonly script: string,
    readonly initialState: SnapshotForPostResponse,
    readonly postScriptExecutionCallback: ScriptWorkloadCallback
  ) {}
}

export enum WorkResultType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type WorkResult = {
  type: WorkResultType;
} & (
  | { type: WorkResultType.SUCCESS; testExecutionResults: TestResult[] }
  | { type: WorkResultType.ERROR; error: WorkError }
);

export enum WorkErrorType {
  UNKNOWN = "UNKNOWN",
  SCRIPT_EXECUTION_FAILED = "SCRIPT_EXECUTION_FAILED",
  SCRIPT_PENDING_WORK_FLUSHING_FAILED = "SCRIPT_PENDING_WORK_FLUSHING_FAILED",
  EXECUTION_ABORTED = "EXECUTION_ABORTED",
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
      name: string;
    }
  | {
      type: WorkErrorType.EXECUTION_ABORTED;
      message: string;
      name: string;
    }
);

export class ScriptExecutionError extends Error {
  static name = "ScriptExecutionError";
  constructor(error: Error) {
    super(error.message);
    this.name = ScriptExecutionError.name;
  }
}

export class ScriptPendingWorkFlushingError extends Error {
  static name = "ScriptPendingWorkFlushingError";
  constructor(error: Error) {
    super(error.message);
    this.name = ScriptPendingWorkFlushingError.name;
  }
}
