import { uniqueId } from "lodash";
import { RQWorker } from "./RQWorker";

interface RQWorkerItem {
  worker: RQWorker;
  id: string;
}

export class WorkerPool {
  private allWorkers: RQWorkerItem[] = [];
  private busyWorkers: RQWorkerItem[] = [];
  private availableWorkers: RQWorkerItem[] = [];
  private MAX_WORKERS = 15;

  private pendingQueue: ((worker: RQWorkerItem) => void)[] = [];

  constructor(private workerFactory: new () => Worker) {
    console.log("!!!debug", "workerPool const", typeof this.workerFactory);
  }

  private createWokerItem(): RQWorkerItem {
    const worker = new RQWorker(this.workerFactory);

    worker.addEventListener("error", () => {
      worker.terminate();
      console.log("!!!debug","worker error terminate it",)
    });

    return {
      worker,
      id: uniqueId(),
    };
  }

  private removeWorker(workerItem: RQWorkerItem) {
    workerItem.worker.terminate();

    this.allWorkers = this.allWorkers.filter((w) => w.id !== workerItem.id);
    this.busyWorkers = this.busyWorkers.filter((w) => w.id !== workerItem.id);
    this.availableWorkers = this.availableWorkers.filter((w) => w.id !== workerItem.id);
  }

  async getWorker(): Promise<RQWorkerItem> {
    if (this.availableWorkers.length > 0) {
      const availableWorker = this.availableWorkers.shift();
      this.busyWorkers.push(availableWorker);
      return availableWorker;
    }

    if (this.allWorkers.length < this.MAX_WORKERS) {
      console.log("!!!debug", "all workers");
      const workerItem = this.createWokerItem();
      this.allWorkers.push(workerItem);
      this.busyWorkers.push(workerItem);
      return workerItem;
    }

    return new Promise<RQWorkerItem>((resolve) => {
      this.pendingQueue.push(resolve);
    });
  }

  async release(workerItem: RQWorkerItem) {
    //Check if worker crashed
    //If yes, remove from lists

    if (this.pendingQueue.length > 0) {
      const receiver = this.pendingQueue.shift();
      receiver(workerItem);
      return;
    }

    //Comlink to sync everything
    this.removeWorker(workerItem);
  }
}
