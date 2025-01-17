import { proxy, Remote, wrap } from "comlink";
import ScriptExecutor from "../../APIClientManager/modules/scriptsV2/workloads/executeScript?worker";

type EventListener = (evt: Event) => void;

export abstract class RQWorker {
  abstract work(workload: any): {} | Error;
  abstract terminate(): void;
}

export class RQScriptWebWorker implements RQWorker {
  private worker: Worker;
  private proxyWorker: Remote<{ type: "TODO" }>;
  private onStateUpdate: (key: string, value: any) => void;
  constructor() {
    this.worker = new ScriptExecutor();
    this.proxyWorker = wrap<{ type: "TODO" }>(this.worker);
    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  async work(workload: any) {
    //handle by comlink
    this.onStateUpdate = workload.onStateUpdate;
    await this.proxyWorker.executeScript(workload.script, workload.initialState, proxy(workload.onStateUpdate));
    console.log("!!!debug", "worker.work called", workload, typeof this.worker.postMessage);
    // How to ensure that every worker exposed should have tthe execute method?
    // this.proxyWorker.execute()
  }

  // async sync() {
  //   // this.proxyWorker.sync();
  //   await this.proxyWorker.syncSnapshot(proxy(this.onStateUpdate));
  // }

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
