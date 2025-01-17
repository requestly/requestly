import { WorkerPool } from "modules/webWorkers/workerPool";
import { RQScriptWebWorker } from "../worker/implementation/RQScriptWebWorker";
import { WorkResult } from "./workLoadTypes";

export class APIClientWorkloadManager {
  private workerPool: WorkerPool<RQScriptWebWorker>;
  constructor() {
    this.workerPool = new WorkerPool<RQScriptWebWorker>(RQScriptWebWorker);
  }

  async execute(workload: any): Promise<WorkResult> {
    if (!workload) {
      throw new Error("Workload is empty");
    }

    const worker = await this.workerPool.acquire();

    const result = await worker.work(workload);

    await this.workerPool.release(worker);

    return result;
  }
}
