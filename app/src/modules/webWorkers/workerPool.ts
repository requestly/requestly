import { RQScriptWebWorker, RQWorker } from "features/apiClient/helpers/modules/scripts/RQScriptWebWorker";

export class WorkerPool<T extends RQScriptWebWorker> {
  private allWorkers = new Map<
    RQWorker,
    {
      isAvailable: boolean;
    }
  >();
  private MAX_WORKERS = 15;
  private pendingQueue: ((worker: T) => void)[] = [];

  constructor(private workerModule: new () => T) {
    console.log("!!!debug", "workerPool const", typeof this.workerModule);
  }

  private async removeWorker(worker: T) {
    await worker.terminate();
    this.allWorkers.delete(worker);
    //
  }

  private spawnNewWorker() {
    const worker = new this.workerModule();
    worker.addEventListener("error", (event) => {
      this.removeWorker(worker);
    });
    this.allWorkers.set(worker, { isAvailable: false });
    return worker;
  }

  async acquire() {
    if (this.allWorkers.size < this.MAX_WORKERS) {
      const worker = this.spawnNewWorker();
      return worker;
    }

    return new Promise<T>((resolve) => {
      this.pendingQueue.push(resolve);
    });
  }

  async release(worker: T) {
    if (this.pendingQueue.length > 0) {
      const receiver = this.pendingQueue.shift();
      receiver(worker);
      return;
    }

    //Comlink to sync everything
    await this.removeWorker(worker);
  }
}
