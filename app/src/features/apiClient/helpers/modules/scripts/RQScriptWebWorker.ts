import { Remote, wrap } from "comlink";
import ScriptExecutor from "../../APIClientManager/modules/scriptsV2/scriptExecutor?worker";

export abstract class RQWorker {
  abstract work(workload: any): {} | Error;
  abstract terminate(): void;
}

export class RQScriptWebWorker implements RQWorker {
  private worker: Worker;
  private proxyWorker: Remote<{ type: "TODO" }>;
  constructor() {
    this.worker = new ScriptExecutor();
    this.proxyWorker = wrap<{ type: "TODO" }>(this.worker);
    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  async work(workload: any) {
    //handle by comlink
    console.log("!!!debug", "worker.work called", workload, typeof this.worker.postMessage);
    // How to ensure that every worker exposed should have tthe execute method?
    // this.proxyWorker.execute()
  }

  async sync() {
    // this.proxyWorker.sync();
  }

  terminate() {
    return this.worker.terminate();
  }

  addEventListener(type: string, listener: EventListener) {
    this.worker.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.worker.removeEventListener(type, listener);
  }
}
