import { WorkerPool } from "modules/webWorkers/workerPool";
import ScriptWorker from "./ScriptWorker?worker";

export class APIClientWorkloadManager {
  private workerPool: WorkerPool;
  constructor() {
    console.log("!!!debug", "workloadmanager called");
    this.workerPool = new WorkerPool(ScriptWorker);
  }

  async execute(workload: any) {
    if (!workload) {
      throw new Error("Workload is empty");
    }

    console.log("!!!debug", "exeecute called", workload);
    const workerItem = await this.workerPool.getWorker();

    const result = await workerItem.worker.work(workload);

    workerItem.worker.postMessage({
      action: "data",
      workload,
    });
    // this.workerPool.release(workerItem);

    return result;
  }
}
