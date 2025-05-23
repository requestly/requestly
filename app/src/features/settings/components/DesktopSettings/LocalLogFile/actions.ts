import { ILocalLogFileConfig } from "./types";

function makeIPCRequestForLocalLogFileConfig(action: string, payloadData?: any) {
  return new Promise((resolve, reject) => {
    window?.RQ?.DESKTOP?.SERVICES?.IPC.invokeEventInMain("rq-storage:storage-action", {
      type: action,
      payload: payloadData ? { data: payloadData } : {},
    })
      .then((res: ILocalLogFileConfig) => {
        if (res) {
          resolve(res);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

export function getAllConfig(): Promise<ILocalLogFileConfig> {
  return makeIPCRequestForLocalLogFileConfig("USER_PREFERENCE:LOCAL_LOG_FILE:GET_ALL") as Promise<ILocalLogFileConfig>;
}

export function setIsEnabledConfig(isLocalLoggingEnabled: boolean) {
  return makeIPCRequestForLocalLogFileConfig("USER_PREFERENCE:LOCAL_LOG_FILE:SET_IS_ENABLED", {
    isLocalLoggingEnabled,
  });
}

export function setLogStorePathConfig(logStorePath: string) {
  return makeIPCRequestForLocalLogFileConfig("USER_PREFERENCE:LOCAL_LOG_FILE:SET_STORE_PATH", { logStorePath });
}

export function setFilterConfig(localLogFilterfilter: string[]) {
  return makeIPCRequestForLocalLogFileConfig("USER_PREFERENCE:LOCAL_LOG_FILE:SET_FILTER", { localLogFilterfilter });
}
