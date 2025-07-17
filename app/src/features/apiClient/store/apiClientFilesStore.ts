import { create } from "zustand";

interface ApiClientFile {
  name: string;
  path: string;
  source: "desktop";
  isFileValid: boolean;
}

export type FileId = string;

export interface ApiClientFilesStore {
  files: Map<FileId, ApiClientFile>;
  appMode: "desktop" | "extension"; // Currently only "desktop" is supported
  isFilePresentLocally: (fileId: FileId) => Promise<boolean>;
  _addFile: (fileId: FileId, fileDetails: any) => void;
  _removeFile: (fileId: FileId) => void;
}

export const createApiClientFilesStore = (appMode: "desktop") => {
  return create<ApiClientFilesStore>()((set, get) => ({
    files: new Map<FileId, ApiClientFile>(),
    appMode,
    isFilePresentLocally: async (fileId: FileId) => {
      const { files } = get();
      const file = files.get(fileId);
      console.log("!!!debug", "file present locally", file);
      const doesFileExist = await window.RQ?.DESKTOP?.SERVICES?.IPC?.invokeEventInMain?.("does-file-exist", file.path);
      files.set(fileId, {
        ...file,
        isFileValid: doesFileExist,
      });
      set({ files: new Map(files) });
      return doesFileExist;
    },
    _addFile: (fileId: FileId, fileDetails: any) => {
      const { files } = get();
      files.set(fileId, {
        name: fileDetails.name,
        path: fileDetails.path,
        source: fileDetails.source,
        isFileValid: true, // Assuming the file is valid when added
      });
      set({ files: new Map(files) });
    },
    _removeFile: (fileId: FileId) => {
      const { files } = get();
      files.delete(fileId);
      set({ files: new Map(files) });
    },
  }));
};

export const apiClientFilesStore = createApiClientFilesStore("desktop");
