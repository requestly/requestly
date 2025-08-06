import { StoreApi } from "zustand";
import { ApiClientFile, ApiClientFilesStore, createApiClientFilesStore, FileId } from "./apiClientFilesStore";
import { createContext, ReactNode, useMemo } from "react";
import { RequestContentType, RQAPI } from "../types";
import { isHttpApiRecord } from "../screens/apiClient/utils";

export const ApiClientFilesContext = createContext<StoreApi<ApiClientFilesStore>>(null);

export const ApiClientFilesProvider = ({
  children,
  records,
}: {
  children: ReactNode;
  records: RQAPI.ApiClientRecord[];
}) => {
  const initialFiles: Record<FileId, ApiClientFile> = useMemo(() => {
    if (!records?.length) {
      return {};
    }

    const files: Record<FileId, ApiClientFile> = {};
    for (const record of records) {
      if (record.type === RQAPI.RecordType.API) {
        if (isHttpApiRecord(record) && record.data.request.contentType === RequestContentType.MULTIPART_FORM) {
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
        }
      }
    }

    return files;
  }, [records]);

  const filesStore = useMemo(() => createApiClientFilesStore("desktop", initialFiles), [initialFiles]);

  return <ApiClientFilesContext.Provider value={filesStore}>{children}</ApiClientFilesContext.Provider>;
};
