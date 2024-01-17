declare global {
  interface Window {
    RQ: any;
  }
}

// ipc wrapper - redundant copy for now
// function ipcRequestToMain(channel: string, requestData?: any, timeout = 10_000) {
//     return new Promise((resolve, reject) => {
//       let responseTimeout = setTimeout(() => {
//         reject(new Error(`IPC request timed out after ${timeout} ms`));
//       }, timeout);
  
//       window?.RQ?.DESKTOP.SERVICES.IPC.invokeEventInMain(channel, requestData).then((res: any) => {
//         resolve(res);
//       });
  
//       window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent(`reply-${channel}`, (event: any, responseData: any) => {
//         clearTimeout(responseTimeout);
//         resolve(responseData);
//       });
//     });
// }


export type AccessedFileCategoryTag = 'web-session' | 'har' | 'unknown'
export interface AccessedFile {
  filePath: string
  category: AccessedFileCategoryTag
  name: string
  lastAccessedTs: number
}

export interface FileObj {
  filePath: string
  name: string
  contents: string
  category?: AccessedFileCategoryTag
}

export const getRecentlyAccesedFiles = (categoryTag: AccessedFileCategoryTag = 'unknown'): Promise<AccessedFile[]> => {
    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("rq-storage:storage-action", {
      type: "ACCESSED_FILES:GET_CATEGORY",
      payload: {
        data: { category: categoryTag }
      }
    }).then((res: AccessedFile[]) => {
      return res;
    }).catch((e: unknown) => {
      console.error("Got error while getting recently accessed files", e);
    })
}

export const openFileSelector = (categoryTag: AccessedFileCategoryTag = 'unknown'): Promise<FileObj> => {
    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("browse-and-load-file", {category: categoryTag}).then((res: FileObj | null) => {
      return res
    }).catch((e: unknown) => {
      console.error("Got error while getting recently accessed files", e);
      throw e;
    })
}

export const getFileContents = (filePath: string): Promise<string> => {
    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("get-file-contents", {filePath}).then((res: string) => {
      return res
    }).catch((e: unknown) => {
      console.error("Got error while getting recently accessed files", e);
      throw e;
    })
}