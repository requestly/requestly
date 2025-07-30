import { Modal } from "antd";
import React, { useMemo } from "react";
import { APIClientRequest } from "./types";
import { RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import {
  filterHeadersToImport,
  generateKeyValuePairs,
  getContentTypeFromRequestHeaders,
  getEmptyApiEntry,
  parseCurlRequest,
} from "features/apiClient/screens/apiClient/utils";
import { CONTENT_TYPE_HEADER } from "features/apiClient/constants";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import "./apiClient.scss";
import { WindowsAndLinuxGatedHoc } from "componentsV2/WindowsAndLinuxGatedHoc";
import { ApiRecordsProvider } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import {
  ApiClientRepositoryContext,
  useGetApiClientSyncRepo,
} from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";

interface Props {
  request: string | APIClientRequest; // string for cURL request
  isModalOpen?: boolean;
  onModalClose?: () => void;
  modalTitle?: string;
}

export const APIClientModal: React.FC<Props> = ({ request, isModalOpen, onModalClose, modalTitle }) => {
  const apiEntry = useMemo<RQAPI.ApiEntry>(() => {
    if (!request) {
      return null;
    }

    if (typeof request === "string") {
      return getEmptyApiEntry(RQAPI.ApiEntryType.HTTP, parseCurlRequest(request));
    }

    const entry: RQAPI.ApiEntry = getEmptyApiEntry(RQAPI.ApiEntryType.HTTP);
    const urlObj = new URL(request.url);
    const searchParams = Object.fromEntries(new URLSearchParams(urlObj.search));
    urlObj.search = "";

    entry.request.url = urlObj.toString();
    entry.request.queryParams = generateKeyValuePairs(searchParams);
    entry.request.headers = filterHeadersToImport(generateKeyValuePairs(request.headers));
    entry.request.method = (request.method as RequestMethod) || RequestMethod.GET;
    entry.request.contentType = getContentTypeFromRequestHeaders(entry.request.headers);

    if (typeof request.body === "string") {
      entry.request.body = request.body;

      if (entry.request.contentType === RequestContentType.FORM) {
        const searchParams = new URLSearchParams(request.body);
        entry.request.body = generateKeyValuePairs(Object.fromEntries(searchParams));
      }
    } else if (request.body instanceof FormData) {
      if (entry.request.contentType !== RequestContentType.FORM) {
        entry.request.contentType = RequestContentType.FORM;
        entry.request.headers.push({
          key: CONTENT_TYPE_HEADER,
          value: RequestContentType.FORM,
          id: Math.random(),
          isEnabled: true,
        });

        const formDataObj: Record<string, string> = {};
        request.body.forEach((value, key) => {
          formDataObj[key] = value as string;
        });
        entry.request.body = generateKeyValuePairs(formDataObj);
      }
    }

    entry.request = {
      ...entry.request,
    };

    return entry;
  }, [request]);

  const repository = useGetApiClientSyncRepo();
  const key = repository.constructor.name;

  if (!apiEntry) {
    return null;
  }

  return (
    <Modal
      className="api-client-modal"
      centered
      title={modalTitle || "API Client"}
      open={isModalOpen}
      onCancel={onModalClose}
      footer={null}
      width="70%"
      destroyOnClose
    >
      <WindowsAndLinuxGatedHoc featureName="API client">
        <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM}>
          <ApiClientRepositoryContext.Provider value={repository} key={key}>
            <ApiRecordsProvider>
              <AutogenerateProvider>
                <GenericApiClient
                  apiEntryDetails={{ data: apiEntry }}
                  handleAppRequestFinished={() => {}}
                  onSaveCallback={() => {}}
                  isCreateMode={true}
                />
              </AutogenerateProvider>
            </ApiRecordsProvider>
          </ApiClientRepositoryContext.Provider>
        </BottomSheetProvider>
      </WindowsAndLinuxGatedHoc>
    </Modal>
  );
};
