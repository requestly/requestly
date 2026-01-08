import type { RQAPI } from "features/apiClient/types";

export type Iteration = number;
export type Timestamp = number;

type BaseRequestExecutionResult = {
  iteration: Iteration;
  recordId: RQAPI.ApiRecord["id"];
  recordName: RQAPI.ApiRecord["name"];
  collectionName: RQAPI.CollectionRecord["name"];
  entry:
    | {
        type: RQAPI.ApiEntryType.HTTP;
        method: RQAPI.HttpRequest["method"];
        responseTime: NonNullable<RQAPI.HttpResponse>["time"] | null;
        statusCode: NonNullable<RQAPI.HttpResponse>["status"] | null;
        statusText: NonNullable<RQAPI.HttpResponse>["statusText"] | null;
      }
    | {
        type: RQAPI.ApiEntryType.GRAPHQL;
        responseTime: NonNullable<RQAPI.GraphQLResponse>["time"] | null;
        statusCode: NonNullable<RQAPI.GraphQLResponse>["status"] | null;
        statusText: NonNullable<RQAPI.GraphQLResponse>["statusText"] | null;
      };
};

export type RequestExecutionResult =
  | (BaseRequestExecutionResult & {
      status: {
        value: RQAPI.ExecutionStatus.SUCCESS;
        warning?: RQAPI.ExecutionWarning;
      };
      runDuration: Timestamp;
      testResults: RQAPI.ApiEntryMetaData["testResults"];
    })
  | (BaseRequestExecutionResult & {
      status: {
        value: RQAPI.ExecutionStatus.ERROR;
        error: RQAPI.ExecutionError;
      };
      runDuration: null;
      testResults: null;
    });

export enum RunStatus {
  IDLE = "idle",
  RUNNING = "running",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  ERRORED = "errored",
}

export type CurrentlyExecutingRequest =
  | null
  | (BaseRequestExecutionResult & {
      startTime: Timestamp;
    });

export type IterationDetails = {
  result: RequestExecutionResult[];
};

export type LiveRunResult = {
  startTime: Timestamp | null;
  endTime: Timestamp | null;
  runStatus: RunStatus;
  iterations: Map<Iteration, IterationDetails>;
};

export type RunResult = LiveRunResult & {
  iterations: Map<Iteration, IterationDetails>;
  runStatus: RunStatus.COMPLETED | RunStatus.CANCELLED;
};

export type SavedRunResult = RunResult & {
  id: string;
  iterations: IterationDetails[];
  runStatus: RunStatus.COMPLETED;
};

export enum HistorySaveStatus {
  IDLE = "idle",
  SAVING = "saving",
  SUCCESS = "success",
  FAILED = "failed",
}

export type RunMetadata = {
  startTime: Timestamp | null;
  endTime: Timestamp | null;
  runStatus: RunStatus;
};

export type CollectionRunCompositeId = string;
