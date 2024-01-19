declare global {
  interface Window {
    RQ: any;
  }
}

export type AccessedFileCategoryTag = "web-session" | "har" | "unknown";
export interface fileRecord {
  filePath: string;
  category: AccessedFileCategoryTag;
  name: string;
  lastAccessedTs: number;
}

export interface FileObj {
  filePath: string;
  name: string;
  contents: string;
  category?: AccessedFileCategoryTag;
}

export const getRecentlyAccesedFiles = (categoryTag: AccessedFileCategoryTag = "unknown"): Promise<fileRecord[]> => {
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("rq-storage:storage-action", {
    type: "ACCESSED_FILES:GET_CATEGORY",
    payload: {
      data: { category: categoryTag },
    },
  })
    .then((res: Record<fileRecord["filePath"], fileRecord>) => {
      const files: fileRecord[] = [];
      console.log("Got recently accessed files", res);
      for (let filePath in res) {
        files.push(res[filePath]);
      }
      return files.sort((a, b) => b.lastAccessedTs - a.lastAccessedTs);
    })
    .catch((e: unknown) => {
      console.error("Got error while getting recently accessed files", e);
    });
};

export const openFileSelector = (categoryTag: AccessedFileCategoryTag = "unknown"): Promise<FileObj> => {
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("browse-and-load-file", { category: categoryTag })
    .then((res: FileObj | null) => {
      return res;
    })
    .catch((e: unknown) => {
      console.error("Got error while getting recently accessed files", e);
      throw e;
    });
};

export const getFileContents = (filePath: string): Promise<string> => {
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("get-file-contents", { filePath })
    .then((res: string) => {
      if (res === "err:NOT FOUND") {
        throw new Error("File not found");
      }
      return res;
    })
    .catch((e: unknown) => {
      console.error("Got error while getting recently accessed files", e);
      throw e;
    });
};
