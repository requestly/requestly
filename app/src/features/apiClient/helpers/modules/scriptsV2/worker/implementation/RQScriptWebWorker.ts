import { proxy, Remote, wrap } from "comlink";

import { RQWorker } from "../interface/RQWorker";
import {
  WorkResult,
  WorkResultType,
  WorkErrorType,
  ScriptWorkload,
  ScriptExecutionError,
  ScriptPendingWorkFlushingError,
} from "../../workload-manager/workLoadTypes";
import { ScriptExecutionWorkerInterface } from "../scriptExecutionWorker/scriptExecutionWorkerInterface";
import ScriptExecutionWorker from "../scriptExecutionWorker/scriptExecutionWorker?worker";

export class RQScriptWebWorker implements RQWorker {
  private internalWorker: Worker;
  private scriptWorker: Remote<ScriptExecutionWorkerInterface>;

  constructor() {
    this.internalWorker = new ScriptExecutionWorker();
    this.scriptWorker = wrap(this.internalWorker);
    this.internalWorker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  setOnErrorCallback(onError: (evt: Event) => void): void {
    this.internalWorker.addEventListener("error", onError);
  }

  async work(workload: ScriptWorkload): Promise<WorkResult> {
    try {
      await this.scriptWorker.executeScript(
        workload.script,
        workload.initialState,
        proxy(workload.postScriptExecutionCallback)
      );
      return {
        type: WorkResultType.SUCCESS,
      };
    } catch (error) {
      if (error instanceof ScriptExecutionError) {
        return {
          type: WorkResultType.ERROR,
          error: {
            type: WorkErrorType.SCRIPT_EXECUTION_FAILED,
            name: error.name,
            message: error.message,
          },
        };
      }
      if (error instanceof ScriptPendingWorkFlushingError) {
        return {
          type: WorkResultType.ERROR,
          error: {
            type: WorkErrorType.SCRIPT_PENDING_WORK_FLUSHING_FAILED,
            name: error.name,
            message: error.message,
          },
        };
      }
      return {
        type: WorkResultType.ERROR,
        error: {
          type: WorkErrorType.UNKNOWN,
          name: error.name,
          message: error.message,
        },
      };
    }
  }

  terminate() {
    return this.internalWorker.terminate();
  }
}
