import { WorkerPool } from "modules/webWorkers/workerPool";
import { RQScriptWebWorker } from "../worker/implementation/RQScriptWebWorker";
import { ScriptWorkload, WorkErrorType, WorkResult, WorkResultType } from "./workLoadTypes";
import { buildAbortErrorObject, TaskAbortedError } from "modules/errors";

export class APIClientWorkloadManager {
  private workerPool: WorkerPool<RQScriptWebWorker>;
  constructor() {
    this.workerPool = new WorkerPool<RQScriptWebWorker>(RQScriptWebWorker);
  }

  async execute(workload: ScriptWorkload, abortSignal: AbortSignal): Promise<WorkResult> {
    return new Promise<WorkResult>((resolve) => {
      this.executeWorkload(workload, resolve, abortSignal);
    });
  }

  private async executeWorkload(
    workload: ScriptWorkload,
    resolve: (result: WorkResult) => void,
    abortSignal: AbortSignal
  ): Promise<void> {
    if (abortSignal.aborted) {
      resolve(buildAbortErrorObject(new TaskAbortedError()));
    }

    try {
      const worker = await this.workerPool.acquire(abortSignal);

      const abortListener = () => {
        abortSignal.removeEventListener("abort", abortListener);
        this.workerPool.release(worker);
        resolve(buildAbortErrorObject(new TaskAbortedError()));
      };

      abortSignal.addEventListener("abort", abortListener);

      const result = await worker.work(workload);
      this.workerPool.release(worker);

      resolve(result);
    } catch (error) {
      if (error instanceof TaskAbortedError) {
        resolve(error.getWorkError());
      } else {
        resolve({
          type: WorkResultType.ERROR,
          error: {
            type: WorkErrorType.UNKNOWN,
            name: error.name,
            message: error.message,
          },
        });
      }
    }
  }
}
