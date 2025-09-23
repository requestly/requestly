import { TestStatus } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/types";
import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";

type Iteration = number;
type Timestamp = number;

type BaseRequestExecutionResult = {
  iteration: Iteration;
  recordId: RQAPI.ApiRecord["id"];
  method: RQAPI.HttpRequest["method"];
};

type RequestExecutionResult =
  | (BaseRequestExecutionResult & {
      status: {
        value: RQAPI.ExecutionStatus.SUCCESS;
        warning?: RQAPI.ExecutionWarning;
      };
      statusCode: number;
      duration: Timestamp;
      testResults: RQAPI.ApiEntryMetaData["testResults"];
    })
  | (BaseRequestExecutionResult & {
      status: {
        value: RQAPI.ExecutionStatus.ERROR;
        error: unknown;
      };
      statusCode: null;
      duration: null;
      testResults: null;
    });

export enum RunStatus {
  IDLE = "idle",
  RUNNING = "running",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  ERRORED = "errored",
}

export type SavedRunResult = {
  id: string; // runId
  totalTests: number;
  successTests: number;
  failedTests: number;
  skippedTests: number;
  startTime: Timestamp;
  endTime: Timestamp | null;
  runStatus: Omit<RunStatus, RunStatus.RUNNING | RunStatus.IDLE>;
  result: RequestExecutionResult[];
};

type RunSummary = Omit<SavedRunResult, "id">;

export type CurrentlyExecutingRequest = null | {
  iteration: Iteration;
  recordId: RQAPI.ApiRecord["id"];
  method: RQAPI.HttpRequest["method"];
  startTime: Timestamp;
};

type IterationDetails = {
  result: RequestExecutionResult[];
};

type RunResultState = {
  startTime: Timestamp | null;
  endTime: Timestamp | null;
  averageResponseTime: Timestamp | null;
  runStatus: RunStatus;
  result: Map<Iteration, IterationDetails>;
  currentlyExecutingRequest: CurrentlyExecutingRequest;

  clearAll(): void;
  setCurrentlyExecutingRequest(request: CurrentlyExecutingRequest): void;
  addResult(result: RequestExecutionResult): void;
  completeRun(status: RunStatus): void;
  getRunSummary(): RunSummary;
};

function getTestSummary(result: RequestExecutionResult) {
  const { testResults } = result;

  let success = 0;
  let failed = 0;
  let skipped = 0;

  testResults.forEach((test) => {
    if (test.status === TestStatus.PASSED) {
      success++;
    } else if (test.status === TestStatus.FAILED) {
      failed++;
    } else {
      skipped++;
    }
  });

  return { total: testResults.length, success, failed, skipped };
}

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

    completeRun(status) {
      set({ runStatus: status });
    },

    getRunSummary() {
      const { startTime, endTime, runStatus, result } = get();

      const allResults: RequestExecutionResult[] = [];
      for (const iterationDetails of result.values()) {
        allResults.push(...iterationDetails.result);
      }

      let totalTests = 0;
      let successTests = 0;
      let failedTests = 0;
      let skippedTests = 0;

      allResults.forEach((executionResult) => {
        if (executionResult.status.value === RQAPI.ExecutionStatus.SUCCESS) {
          if (executionResult.testResults) {
            const { success, failed, skipped, total } = getTestSummary(executionResult);
            totalTests += total;
            successTests += success;
            failedTests += failed;
            skippedTests += skipped;
          }
        }
      });

      return {
        totalTests,
        successTests,
        failedTests,
        skippedTests,
        startTime,
        endTime,
        runStatus,
        result: allResults,
      };
    },
  }));
}
