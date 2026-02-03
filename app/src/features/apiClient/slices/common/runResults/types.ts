import type { ExecutionId, RQAPI } from "features/apiClient/types";

export type Iteration = number;
export type Timestamp = number;

export type BaseRequestExecutionResult = {
  iteration: Iteration;
  executionId: ExecutionId;
  recordId: RQAPI.ApiRecord["id"];
  recordName: RQAPI.ApiRecord["name"];
  collectionName: RQAPI.CollectionRecord["name"];
  request?: RQAPI.Request;
  response?: RQAPI.Response;
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
  | (Omit<BaseRequestExecutionResult, "executionId"> & {
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
  runStatus: RunStatus.COMPLETED | RunStatus.CANCELLED;
};

export type SavedRunResult = RunResult & {
  id: string;
  iterations: IterationDetails[];
  runStatus: RunStatus.COMPLETED;
};

export type RunMetadata = {
  startTime: Timestamp | null;
  endTime: Timestamp | null;
  runStatus: RunStatus;
};

export type CollectionRunCompositeId = string;
