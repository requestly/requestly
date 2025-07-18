import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ApiClientFile {
  name: string;
  path: string;
  source: "desktop" | "extension"; // Currently only "desktop" is supported
  // isFileValid indicates whether the file exists and is valid in the local filesystem
  isFileValid: boolean;
}

export type FileId = string;

export interface ApiClientFilesStore {
  files: Record<FileId, ApiClientFile>;
  appMode: "desktop" | "extension"; // Currently only "desktop" is supported
  isFilePresentLocally: (fileId: FileId) => Promise<boolean>;
  addFile: (fileId: FileId, fileDetails: any) => void;
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
          console.log("!!!debug", "file present locally", file);
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
