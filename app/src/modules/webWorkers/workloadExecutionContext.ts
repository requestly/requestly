import { RQWorker } from "../../features/apiClient/helpers/modules/scripts/RQScriptWebWorker";

export class WorkloadExecutionContext<T extends RQWorker> {
  constructor(private worker: T, private workerReleaseFunction: (worker: RQWorker) => void) {}

  async execute(workload: any) {
    return this.worker.work(workload);
  }

  release() {
    this.workerReleaseFunction(this.worker);
  }
}
