import { WorkResult } from "../../workload-manager/workLoadTypes";

export abstract class RQWorker {
  abstract work(workload: any, abortSignal?: AbortSignal): Promise<WorkResult>;
  abstract terminate(): void;
  abstract setOnErrorCallback(onError: (evt: Event) => void): void;
}
