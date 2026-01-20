import { wrap, Remote } from "comlink";
import UtilityWebWorker from "./utilityWebWorker.ts?worker";

interface UtilityWorkerAPI {
  parseJsonText(text: string): Promise<any>;
}

class UtilityWorker {
  private worker: Worker | null = null;
  private workerAPI: Remote<UtilityWorkerAPI> | null = null;

  private getWorkerAPI(): Remote<UtilityWorkerAPI> {
    if (!this.workerAPI) {
      this.worker = new UtilityWebWorker();
      this.workerAPI = wrap<UtilityWorkerAPI>(this.worker);
    }
    return this.workerAPI;
  }

  public async parseJsonText(text: string): Promise<any> {
    return this.getWorkerAPI().parseJsonText(text);
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerAPI = null;
    }
  }
}

const utilityWorker = new UtilityWorker();

export { utilityWorker };
