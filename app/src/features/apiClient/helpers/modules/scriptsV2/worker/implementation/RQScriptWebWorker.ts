import { proxy, Remote, wrap } from "comlink";

import { RQWorker } from "../interface/RQWorker";
import { WorkResult, WorkResultType, WorkErrorType, ScriptWorkload } from "../../workload-manager/workLoadTypes";
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

  private async executeScript(workload: ScriptWorkload): Promise<WorkResult> {
    try {
      await this.scriptWorker.executeScript(workload.script, workload.initialState, proxy(workload.onStateUpdate));
      return {
        type: WorkResultType.SUCCESS,
      };
    } catch (error) {
      return {
        type: WorkResultType.ERROR,
        error: {
          type: WorkErrorType.SCRIPT_EXECUTION_FAILED,
          name: error.name,
          message: error.message,
        },
      };
    }
  }

  private async flushPendingWork(): Promise<WorkResult> {
    try {
      await this.scriptWorker.flushPendingWork();
      return {
        type: WorkResultType.SUCCESS,
      };
    } catch (error) {
      console.error("Could not flush pending work of worker. Encountered error:", error);
      return {
        type: WorkResultType.ERROR,
        error: {
          type: WorkErrorType.SCRIPT_PENDING_WORK_FLUSHING_FAILED,
          message: error.message,
        },
      };
    }
  }

  async work(workload: ScriptWorkload): Promise<WorkResult> {
    const scriptExecutionWorkResult = await this.executeScript(workload);
    if (scriptExecutionWorkResult.type === WorkResultType.ERROR) {
      return scriptExecutionWorkResult;
    }
    return this.flushPendingWork();
  }

  terminate() {
    return this.internalWorker.terminate();
  }
}
