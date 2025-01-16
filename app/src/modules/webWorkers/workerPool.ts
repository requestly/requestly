export class WorkerPool {
  private availableWorkers: Worker[] = [];
  private busyWorkers: Worker[] = [];
  private freeWorkers: Worker[] = [];
  private pendingQueue: ((worker: Worker) => void)[] = [];

  async getWorker(worker: Worker) {}
}
