import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ApiClientFile {
  name: string;
  path: string;
  source: "desktop" | "extension"; // Currently only "desktop" is supported
  size: number;
  // isFileValid indicates whether the file exists and is valid in the local filesystem
  isFileValid: boolean;
}

export type FileId = string;

export interface ApiClientFilesStore {
  files: Record<FileId, ApiClientFile>;
  appMode: "desktop" | "extension"; // Currently only "desktop" is supported
  isFilePresentLocally: (fileId: FileId) => Promise<boolean>;
  addFile: (fileId: FileId, fileDetails: any) => void;
  getFilesByIds: (fileIds: string[]) => (ApiClientFile & { id: string })[];
  removeFile: (fileId: FileId) => void;
}

export const createApiClientFilesStore = (appMode: "desktop", initialFiles: Record<FileId, ApiClientFile>) => {
  return create<ApiClientFilesStore>()(
    persist(
      (set, get) => ({
        files: initialFiles,
        appMode,
        isFilePresentLocally: async (fileId: FileId) => {
          const { files } = get();
          const file = files[fileId];
          const doesFileExist = await window.RQ?.DESKTOP?.SERVICES?.IPC?.invokeEventInMain?.(
            "does-file-exist",
            file.path
          );
          files[fileId] = {
            ...file,
            isFileValid: doesFileExist,
          };
          set({ files });
          return doesFileExist;
        },
        addFile: (fileId: FileId, fileDetails: any) => {
          const { files } = get();
          files[fileId] = {
            ...fileDetails,
            isFileValid: true, // Assuming the file is valid when added
          };
          set({ files });
        },
        removeFile: (fileId: FileId) => {
          const { files } = get();
          delete files[fileId];
          set({ files });
        },
        getFilesByIds: (fileIds: string[]) => {
          const { files } = get();
          return fileIds.map((fileId) => ({ id: fileId, ...files[fileId] })).filter((file) => file.name !== undefined);
        },
        reset: () => {
          set({
            files: {},
            appMode: "desktop",
          });
        },
      }),
      {
        name: "apiClientFilesStore",
        version: 1,
        partialize: (state) => ({
          files: state.files,
          appMode: state.appMode,
        }),
      }
    )
  );
};
