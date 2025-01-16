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
    const worker = await this.workerPool.acquire();

    const result = await worker.work(workload);

    worker.postMessage({
      action: "data",
      workload,
    });
    this.workerPool.release(worker);

    return result;
  }
}
