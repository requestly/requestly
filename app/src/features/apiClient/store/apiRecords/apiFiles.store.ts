import { create } from "zustand";

export type FileStoreId = string;
export interface apiFilesStore {
  files: Record<FileStoreId, File>; // might be different for desktop
  appMode: "desktop" | "extension"; // default desktop

  isFilePresent: () => void;
  _addFile: () => void;
  _removeFile: () => void;
  getFile: () => void;
}
