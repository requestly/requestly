import { NativeError } from "errors/NativeError";
import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";

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

export type LiveRunResult = Pick<RunResultState, "startTime" | "endTime" | "runStatus" | "result">;

export type RunResult = LiveRunResult & {
  runStatus: RunStatus.COMPLETED | RunStatus.CANCELLED;
};

export type SavedRunResult = RunResult & { id: string; result: [Iteration, IterationDetails][] };

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
  runStatus: RunStatus;
  result: Map<Iteration, IterationDetails>;
  currentlyExecutingRequest: CurrentlyExecutingRequest;
  abortController: AbortController;

  history: RunResult[];

  reset(): void;
  setCurrentlyExecutingRequest(request: CurrentlyExecutingRequest): void;
  addResult(result: RequestExecutionResult): void;
  setRunStatus(status: RunStatus): void;
  getRunSummary(): LiveRunResult;
};

export function createRunResultStore() {
  return create<RunResultState>()((set, get) => ({
    startTime: null,
    endTime: null,
    runStatus: RunStatus.IDLE,
    result: new Map(),
    history: [],
    currentlyExecutingRequest: null,
    abortController: new AbortController(),

    reset() {
      set({
        startTime: null,
        endTime: null,
        runStatus: RunStatus.IDLE,
        result: new Map(),
        currentlyExecutingRequest: null,
        abortController: new AbortController(),
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

      return {
        endTime,
        startTime,
        runStatus,
        result,
      };
    },
  }));
}
