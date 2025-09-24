import { NativeError } from "errors/NativeError";
import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { getAllTestSummary } from "./utils";

export type Iteration = number;
type Timestamp = number;

type BaseRequestExecutionResult = {
  iteration: Iteration;
  recordId: RQAPI.ApiRecord["id"];
  recordName: RQAPI.ApiRecord["name"];
  entry:
    | {
        type: RQAPI.ApiEntryType.HTTP;
        method: RQAPI.HttpRequest["method"];
        responseTime: RQAPI.HttpResponse["time"] | null;
        statusCode: RQAPI.HttpResponse["status"] | null;
        statusText: RQAPI.HttpResponse["statusText"] | null;
      }
    | {
        type: RQAPI.ApiEntryType.GRAPHQL;
        responseTime: RQAPI.GraphQLResponse["time"] | null;
        statusCode: RQAPI.GraphQLResponse["status"] | null;
        statusText: RQAPI.GraphQLResponse["statusText"] | null;
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

export class InvalidRunnerStateChange extends NativeError {}

const RunStateMachine = {
  [RunStatus.IDLE]: [RunStatus.RUNNING],
  [RunStatus.RUNNING]: [RunStatus.CANCELLED, RunStatus.COMPLETED, RunStatus.ERRORED],
  [RunStatus.CANCELLED]: [RunStatus.IDLE],
  [RunStatus.COMPLETED]: [RunStatus.IDLE],
  [RunStatus.ERRORED]: [RunStatus.IDLE],
};

export type SavedRunResult = {
  id: string; // runId
  totalTests: number;
  successTests: number;
  failedTests: number;
  skippedTests: number;
  startTime: Timestamp;
  endTime: Timestamp | null;
  duration: Timestamp | null;
  runStatus: Omit<RunStatus, RunStatus.RUNNING | RunStatus.IDLE>;
  result: RequestExecutionResult[];
};

type RunSummary = Omit<SavedRunResult, "id">;

export type CurrentlyExecutingRequest =
  | null
  | (BaseRequestExecutionResult & {
      startTime: Timestamp;
    });

export type IterationDetails = {
  result: RequestExecutionResult[];
};

export type RunResultState = {
  startTime: Timestamp | null;
  endTime: Timestamp | null;
  averageResponseTime: Timestamp | null;
  runStatus: RunStatus;
  result: Map<Iteration, IterationDetails>;
  currentlyExecutingRequest: CurrentlyExecutingRequest;

  clearAll(): void;
  setCurrentlyExecutingRequest(request: CurrentlyExecutingRequest): void;
  addResult(result: RequestExecutionResult): void;
  setRunStatus(status: RunStatus): void;
  getRunSummary(): RunSummary;
};

export function createRunResultStore() {
  return create<RunResultState>()((set, get) => ({
    startTime: null,
    endTime: null,
    averageResponseTime: null,
    runStatus: RunStatus.IDLE,
    result: new Map(),
    currentlyExecutingRequest: null,

    clearAll() {
      set({
        startTime: null,
        endTime: null,
        averageResponseTime: null,
        runStatus: RunStatus.IDLE,
        result: new Map(),
        currentlyExecutingRequest: null,
      });
    },

    setCurrentlyExecutingRequest(request) {
      set({ currentlyExecutingRequest: request });
    },

    addResult(newResult) {
      const { result } = get();

      const existingResult = result.get(newResult.iteration);

      if (!existingResult) {
        result.set(newResult.iteration, { result: [newResult] });
        set({ result: new Map(result) });
        return;
      }

      const updatedResult = [...existingResult.result, newResult];
      result.set(newResult.iteration, { result: updatedResult });
      set({ result: new Map(result) });
    },

    setRunStatus(status) {
      const currentStatus = get().runStatus;
      const isStateChangleAllowed = RunStateMachine[currentStatus].includes(status);
      if (!isStateChangleAllowed) {
        throw new InvalidRunnerStateChange(`Invalid state change from ${currentStatus} to ${status}`);
      }
      set({ runStatus: status });
    },

    getRunSummary() {
      const { startTime, endTime, runStatus, result } = get();
      const {
        totalTestsCounts,
        successTestsCounts,
        failedTestsCounts,
        skippedTestsCounts,
        allResults,
        duration,
      } = getAllTestSummary(result);

      return {
        endTime,
        startTime,
        runStatus,
        duration,
        result: allResults,
        totalTests: totalTestsCounts,
        successTests: successTestsCounts,
        failedTests: failedTestsCounts,
        skippedTests: skippedTestsCounts,
      };
    },
  }));
}
