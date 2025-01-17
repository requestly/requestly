import { Remote, wrap } from "comlink";

abstract class RQWorker {
  abstract work(workload: any): {} | Error;
}

class RQWebWorker implements RQWorker {
  private worker: Worker;
  private proxyWorker: Remote<any>;
  constructor(workerModule: new () => Worker) {
    console.log("!!!debug", "RQwebworker", workerModule);
    this.worker = new workerModule();
    this.proxyWorker = wrap<any>(this.worker);
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

export { RQWebWorker as RQWorker };
