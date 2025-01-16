import { RQWorker } from "./RQWorker";

export class WorkloadExecutionContext {
  constructor(private worker: RQWorker, private workerReleaseFunction: (worker: RQWorker) => void) {}

  async execute(workload: any) {
    return this.worker.work(workload);
  }

  release() {
    this.workerReleaseFunction(this.worker);
  }
}
