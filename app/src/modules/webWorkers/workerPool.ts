import { RQWorker } from "features/apiClient/helpers/modules/scriptsV2/worker/interface/RQWorker";

export class WorkerPool<T extends RQWorker> {
  private allWorkers = new Map<
    T,
    {
      isAvailable: boolean;
    }
  >();
  private MAX_WORKERS = 15;
  private pendingQueue: ((worker: T) => void)[] = [];

  constructor(private workerModule: new () => T) {}

  private async removeWorker(worker: T) {
    await worker.terminate();
    this.allWorkers.delete(worker);
  }

  private spawnNewWorker() {
    const worker = new this.workerModule();
    worker.setOnErrorCallback(() => {
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

    await this.removeWorker(worker);
  }
}
