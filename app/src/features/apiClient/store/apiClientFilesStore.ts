import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

export enum FileFeature {
  FILE_BODY = "file_body",
  COLLECTION_RUNNER = "collection_runner",
}

export interface ApiClientFile {
  name: string;
  path: string;
  source: "desktop" | "extension"; // Currently only "desktop" is supported
  size: number;
  fileFeature: FileFeature;
  // isFileValid indicates whether the file exists and is valid in the local filesystem
  isFileValid: boolean;
}

export type FileId = string;

export const shouldHydrate = (fileFeature: FileFeature) => {
  return fileFeature !== FileFeature.COLLECTION_RUNNER;
};

export interface ApiClientFilesStore {
  files: Record<FileId, ApiClientFile>;
  appMode: "desktop" | "extension"; // Currently only "desktop" is supported
  isFilePresentLocally: (fileId: FileId) => Promise<boolean>;

  replace: (files: Record<FileId, ApiClientFile>, fileFeature: FileFeature) => void;
  addFile: (fileId: FileId, fileDetails: Omit<ApiClientFile, "isFileValid">) => void;
  getFilesByIds: (fileIds: string[]) => (ApiClientFile & { id: string })[];
  removeFile: (fileId: FileId) => void;
}

const createApiClientFilesStore = (appMode: "desktop") => {
  return create<ApiClientFilesStore>()(
    persist(
      (set, get) => ({
        files: {},
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
          const updatedFiles = {
            ...files,
          };
          set({ files: updatedFiles });
          return doesFileExist;
        },

        replace(fileRecords: Record<FileId, ApiClientFile>, fileFeature: FileFeature) {
          // const filesFromRecords = parseRecordsToFiles(records);
          const { files: existingFiles } = get();

          // Only keep existing files that are not FILE_BODY type
          const filteredExistingFiles = Object.fromEntries(
            Object.entries(existingFiles).filter(([_, file]) => file.fileFeature !== fileFeature)
          );

          set({
            files: { ...filteredExistingFiles, ...fileRecords },
          });
        },

        addFile: (fileId: FileId, fileDetails: Omit<ApiClientFile, "isFileValid">) => {
          const { files } = get();
          set({
            files: {
              ...files,
              [fileId]: {
                ...fileDetails,
                isFileValid: true, // Assuming the file is valid when added
              },
            },
          });
        },

        removeFile: (fileId: FileId) => {
          const { files } = get();
          const newFiles = { ...files };
          delete newFiles[fileId];
          set({ files: newFiles });
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
        partialize: (state) => {
          const filteredExistingFiles = Object.fromEntries(
            Object.entries(state.files).filter(([_, file]) => shouldHydrate(file.fileFeature))
          );
          return { files: filteredExistingFiles, appMode: state.appMode };
        },
      }
    )
  );
};

export const apiClientFileStore = createApiClientFilesStore("desktop");

export function useApiClientFileStore<T>(selector: (state: ApiClientFilesStore) => T) {
  return useStore(apiClientFileStore, useShallow(selector));
}
