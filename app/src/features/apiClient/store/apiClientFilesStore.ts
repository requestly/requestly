import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { RequestContentType, RQAPI } from "../types";
import { isHttpApiRecord } from "../screens/apiClient/utils";
import { useShallow } from "zustand/shallow";

function getFilesFromRecord(record: RQAPI.ApiClientRecord) {
  const files: Record<FileId, ApiClientFile> = {};
  const canHaveFiles =
    record.type === RQAPI.RecordType.API &&
    isHttpApiRecord(record) &&
    record.data.request.contentType === RequestContentType.MULTIPART_FORM;

  if (!canHaveFiles) {
    return;
  }
  const requestBody = record.data.request.body as RQAPI.MultipartFormBody;
  for (const bodyEntry of requestBody) {
    const bodyValue = bodyEntry.value as RQAPI.FormDataKeyValuePair["value"];
    if (Array.isArray(bodyValue)) {
      bodyValue?.forEach((file) => {
        files[file.id] = {
          name: file.name,
          path: file.path,
          source: file.source,
          size: file.size,
          isFileValid: true,
        };
      });
    }
  }

  return files;
}

function parseRecordsToFiles(records: RQAPI.ApiClientRecord[]) {
  let files: Record<FileId, ApiClientFile> = {};
  for (const record of records) {
    const filesFromRecord = getFilesFromRecord(record);
    if (filesFromRecord) {
      files = { ...files, ...filesFromRecord };
    }
  }

  return files;
}

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

  initialize: (records: RQAPI.ApiClientRecord[]) => void;
  addFile: (fileId: FileId, fileDetails: any) => void;
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
          set({ files });
          return doesFileExist;
        },

        initialize(records) {
          const files = parseRecordsToFiles(records);
          set({
            files,
          });
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

export const apiClientFileStore = createApiClientFilesStore("desktop");

export function useApiClientFileStore<T>(selector: (state: ApiClientFilesStore) => T ) {
  return useStore(apiClientFileStore, useShallow(selector));
}
