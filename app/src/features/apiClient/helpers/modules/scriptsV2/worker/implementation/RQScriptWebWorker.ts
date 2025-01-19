import { proxy, Remote, wrap } from "comlink";

import { RQWorker } from "../interface/RQWorker";
import { WorkResult, WorkResultType, WorkErrorType, ScriptWorkload } from "../../workload-manager/workLoadTypes";
import { ScriptExecutionWorkerInterface } from "../scriptExecutionWorker/scriptExecutionWorkerInterface";
import ScriptExecutionWorker from "../scriptExecutionWorker/scriptExecutionWorker?worker";

export class RQScriptWebWorker implements RQWorker {
  private worker: Worker;
  private proxyWorker: Remote<ScriptExecutionWorkerInterface>;
  private onStateUpdate: (key: string, value: any) => void;

  constructor() {
    this.worker = new ScriptExecutionWorker();
    this.proxyWorker = wrap(this.worker);
    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  setOnErrorCallback(onError: (evt: Event) => void): void {
    this.worker.addEventListener("error", onError);
  }

  async work(workload: ScriptWorkload): Promise<WorkResult> {
    this.onStateUpdate = workload.onStateUpdate;
    try {
      await this.proxyWorker.executeScript(workload.script, workload.initialState, proxy(workload.onStateUpdate));
      return {
        type: WorkResultType.SUCCESS,
      };
    } catch (error) {
      return {
        type: WorkResultType.ERROR,
        error: {
          type: WorkErrorType.UNEXPECTED,
          name: error.name,
          message: error.message,
        },
      };
    }
  }

  async terminate() {
    await this.proxyWorker.syncSnapshot(proxy(this.onStateUpdate));
    return this.worker.terminate();
  }
}
