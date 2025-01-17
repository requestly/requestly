import { proxy, Remote, wrap } from "comlink";
import ScriptExecutor from "../../worker/scriptExecutionWorker?worker";
import { RQWorker } from "../interface/RQWorker";
import { WorkResult, WorkResultType, WorkErrorType } from "../../workload-manager/workLoadTypes";
import { ScriptExecutionWorker } from "../scriptExecutionWorker";

export class RQScriptWebWorker implements RQWorker {
  private worker: Worker;
  private proxyWorker: Remote<ScriptExecutionWorker>;
  private onStateUpdate: (key: string, value: any) => void;

  constructor() {
    this.worker = new ScriptExecutor();
    // this.worker.addEventListener("error", this.onErrorCallback);
    this.proxyWorker = wrap<ScriptExecutionWorker>(this.worker);
    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  setOnErrorCallback(onError: EventListener): void {
    this.worker.addEventListener("error", onError);
  }

  async work(workload: any): Promise<WorkResult> {
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

  addEventListener(type: string, listener: EventListener) {
    this.worker.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.worker.removeEventListener(type, listener);
  }
}
