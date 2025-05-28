import { UserAbortError } from "features/apiClient/errors/UserAbortError/UserAbortError";
import { RQWorker } from "features/apiClient/helpers/modules/scriptsV2/worker/interface/RQWorker";
import { AbortReason } from "features/apiClient/types";
import { TaskAbortedError } from "modules/errors";

export class WorkerPool<T extends RQWorker> {
  private busyWorkers = new Set<T>();
  private MAX_WORKERS = 15;
  private pendingQueue = new Set<(worker: T) => void>();

  constructor(private workerModule: new () => T) {}

  private removeWorker(worker: T) {
    worker.terminate();
    this.busyWorkers.delete(worker);
  }

  private spawnNewWorker() {
    const worker = new this.workerModule();
    worker.setOnErrorCallback(() => {
      this.removeWorker(worker);
    });
    this.busyWorkers.add(worker);
    return worker;
  }

  async acquire(abortSignal: AbortSignal) {
    if (this.busyWorkers.size < this.MAX_WORKERS) {
      if (abortSignal.aborted) {
        if (abortSignal.reason === AbortReason.USER_CANCELLED) {
          throw new UserAbortError();
        }
        throw new TaskAbortedError();
      }
      const worker = this.spawnNewWorker();
      return worker;
    }

    return new Promise<T>((resolve, reject) => {
      const abortListener = () => {
        abortSignal.removeEventListener("abort", abortListener);
        this.pendingQueue.delete(resolve);
        reject(new TaskAbortedError());
      };

      abortSignal.addEventListener("abort", abortListener);

      this.pendingQueue.add(resolve);
    });
  }

  release(worker: T) {
    this.removeWorker(worker);

    if (this.pendingQueue.size === 0) {
      return;
    }

    const receiver = this.pendingQueue.values().next().value;
    this.pendingQueue.delete(receiver);
    const newWorker = this.spawnNewWorker();
    receiver(newWorker);
  }
}
