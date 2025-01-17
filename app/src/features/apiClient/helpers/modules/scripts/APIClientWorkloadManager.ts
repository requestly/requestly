import { WorkerPool } from "modules/webWorkers/workerPool";
import { RQScriptWebWorker } from "./RQScriptWebWorker";

export class APIClientWorkloadManager {
  private workerPool: WorkerPool<RQScriptWebWorker>;
  constructor() {
    console.log("!!!debug", "workloadmanager called");
    this.workerPool = new WorkerPool<RQScriptWebWorker>(RQScriptWebWorker);
  }

  async execute(workload: any) {
    if (!workload) {
      throw new Error("Workload is empty");
    }

    console.log("!!!debug", "exeecute called", workload);
    const worker = await this.workerPool.acquire();

    const result = await worker.work(workload);

    this.workerPool.release(worker);

    return result;
  }
}
