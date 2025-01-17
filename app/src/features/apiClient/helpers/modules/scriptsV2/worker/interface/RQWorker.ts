import { WorkResult } from "../../workload-manager/workLoadTypes";

export abstract class RQWorker {
  abstract work(workload: any): Promise<WorkResult>;
  abstract terminate(): Promise<void>;
  abstract onErrorCallback(onError: EventListener): void;
}
