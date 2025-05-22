import { IOfflineLogConfig } from "./types";

function makeIPCRequestForOfflineLogConfig(action: string, payloadData?: any) {
  return new Promise((resolve, reject) => {
    window?.RQ?.DESKTOP?.SERVICES?.IPC.invokeEventInMain("rq-storage:storage-action", {
      type: action,
      payload: payloadData ? { data: payloadData } : {},
    })
      .then((res: IOfflineLogConfig) => {
        if (res) {
          resolve(res);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

export function getAllConfig(): Promise<IOfflineLogConfig> {
  return makeIPCRequestForOfflineLogConfig("USER_PREFERENCE:OFFLINE_LOG_CONFIG:GET_ALL") as Promise<IOfflineLogConfig>;
}

export function setIsEnabledConfig(isEnabled: boolean) {
  return makeIPCRequestForOfflineLogConfig("USER_PREFERENCE:OFFLINE_LOG_CONFIG:SET_IS_ENABLED", { isEnabled });
}

export function setLogStorePathConfig(storePath: string) {
  return makeIPCRequestForOfflineLogConfig("USER_PREFERENCE:OFFLINE_LOG_CONFIG:SET_STORE_PATH", { storePath });
}

export function setFilterConfig(filter: string[]) {
  return makeIPCRequestForOfflineLogConfig("USER_PREFERENCE:OFFLINE_LOG_CONFIG:SET_FILTER", { filter });
}
