import { proxy, Remote, wrap } from "comlink";

import { RQWorker } from "../interface/RQWorker";
import {
  WorkResult,
  WorkResultType,
  WorkErrorType,
  ScriptWorkload,
  SyncLocalDumpCallback,
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

  private async executeScript(workload: ScriptWorkload): Promise<WorkResult> {
    try {
      await this.scriptWorker.executeScript(workload.script, workload.initialState);
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

  private async flushPendingWork(callback: SyncLocalDumpCallback): Promise<WorkResult> {
    try {
      await this.scriptWorker.syncLocalDump(proxy(callback));
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
          name: error.name,
        },
      };
    }
  }

  async work(workload: ScriptWorkload): Promise<WorkResult> {
    const scriptExecutionWorkResult = await this.executeScript(workload);
    if (scriptExecutionWorkResult.type === WorkResultType.ERROR) {
      return scriptExecutionWorkResult;
    }
    return this.flushPendingWork(workload.postScriptExecutionCallback);
  }

  terminate() {
    return this.internalWorker.terminate();
  }
}
