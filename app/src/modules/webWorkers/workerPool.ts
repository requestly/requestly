import { RQWorker } from "./RQWorker";

export class WorkerPool {
  private allWorkers = new Map<
    RQWorker,
    {
      isAvailable: boolean;
    }
  >();
  private MAX_WORKERS = 15;
  private pendingQueue: ((worker: RQWorker) => void)[] = [];

  constructor(private workerModule: new () => Worker) {
    console.log("!!!debug", "workerPool const", typeof this.workerModule);
  }

  private removeWorker(worker: RQWorker) {
    worker.terminate();
    this.allWorkers.delete(worker);
    //
  }

  private spawnNewWorker() {
    const worker = new RQWorker(this.workerModule);
    worker.addEventListener("error", (event) => {
      this.removeWorker(worker);
    });
    this.allWorkers.set(worker, { isAvailable: false });
    return worker;
  }

  async acquire(): Promise<RQWorker> {
    if (this.allWorkers.size < this.MAX_WORKERS) {
      const worker = this.spawnNewWorker();
      return worker;
    }

    return new Promise<RQWorker>((resolve) => {
      this.pendingQueue.push(resolve);
    });
  }

  async release(worker: RQWorker) {
    if (this.pendingQueue.length > 0) {
      const receiver = this.pendingQueue.shift();
      receiver(worker);
      return;
    }

    //Comlink to sync everything
    this.removeWorker(worker);
  }
}
