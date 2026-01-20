import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import { NetworkSessionRecord } from "./types";

declare global {
  interface Window {
    RQ: any;
  }
}

export async function deleteNetworkSession(id: string) {
  return window?.RQ?.DESKTOP.SERVICES.IPC.invokeEventInMain("delete-network-session", { id });
}

// ipc wrapper
function ipcRequest(channel: string, requestData: any, timeout = 10_000): any {
  return new Promise((resolve, reject) => {
    let responseTimeout = setTimeout(() => {
      reject(new Error(`IPC request timed out after ${timeout} ms`));
    }, timeout);

    window?.RQ?.DESKTOP.SERVICES.IPC.invokeEventInMain(channel, requestData).then((res: any) => {
      resolve(res);
    });

    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent(`reply-${channel}`, (event: any, responseData: any) => {
      clearTimeout(responseTimeout);
      resolve(responseData);
    });
  });
}

export async function saveNetworkSession(name: string, har: Har, filePath?: string): Promise<string> {
  const payload = { name, har, originalFilePath: filePath };
  return ipcRequest("save-network-session", payload)
    .then((id: string) => {
      return id;
    })
    .catch((e: unknown) => {
      console.error("Got error while saving session", e);
      return "";
    });
}

export async function getNetworkSession(id: string): Promise<NetworkSessionRecord | null> {
  return ipcRequest("get-network-session", { id })
    .then((res: NetworkSessionRecord) => {
      return res;
    })
    .catch((e: unknown): null => {
      console.error(`Got error while getting session ${id}`, e);
      return null;
    });
}
