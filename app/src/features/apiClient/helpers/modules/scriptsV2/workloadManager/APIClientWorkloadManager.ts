import { WorkerPool } from "modules/webWorkers/workerPool";
import { RQScriptWebWorker } from "../worker/implementation/RQScriptWebWorker";
import { ScriptWorkload, WorkErrorType, WorkResult, WorkResultType } from "./workLoadTypes";
import { buildAbortErrorObject, TaskAbortedError } from "modules/errors";
import { UserAbortError } from "features/apiClient/errors/UserAbortError/UserAbortError";
import { AbortReason } from "features/apiClient/types";

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

  private createAbortError(abortSignal: AbortSignal) {
    if (abortSignal.reason === AbortReason.USER_CANCELLED) {
      return buildAbortErrorObject(new UserAbortError());
    }
    return buildAbortErrorObject(new TaskAbortedError());
  }

  private async executeWorkload(
    workload: ScriptWorkload,
    resolve: (result: WorkResult) => void,
    abortSignal: AbortSignal
  ): Promise<void> {
    if (abortSignal.aborted) {
      resolve(this.createAbortError(abortSignal));
    }

    try {
      const worker = await this.workerPool.acquire(abortSignal);

      const abortListener = () => {
        abortSignal.removeEventListener("abort", abortListener);
        this.workerPool.release(worker);
        resolve(this.createAbortError(abortSignal));
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
