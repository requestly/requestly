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
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "features/apiClient/screens/apiClient/clientView/ClientViewFactory";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { NoopContextId } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

interface Props {
  request: string | APIClientRequest; // string for cURL request
  isModalOpen?: boolean;
  onModalClose?: () => void;
  modalTitle?: string;
}

const createDummyApiRecord = (apiEntry: RQAPI.ApiEntry): RQAPI.ApiRecord => {
  // This record is created only for cases when client view is opened without any option to save the request.
  // if saving is enabled in such cases, please take the necessary fields into account (eg. id, ownerId...).
  return {
    id: "",
    name: "Untitled request",
    type: RQAPI.RecordType.API,
    data: apiEntry,
    collectionId: "",
    ownerId: "",
    deleted: false,
    createdBy: "",
    createdTs: Date.now(),
    updatedTs: Date.now(),
    updatedBy: "",
  };
};

// Its okay if we dont open GraphQL request from network table
export const APIClientModal: React.FC<Props> = ({ request, isModalOpen, onModalClose, modalTitle }) => {
  const apiRecord = useMemo<RQAPI.ApiRecord>(() => {
    if (!request) {
      return null;
    }

    if (typeof request === "string") {
      return createDummyApiRecord(getEmptyApiEntry(RQAPI.ApiEntryType.HTTP, parseCurlRequest(request)));
    }

    const entry = getEmptyApiEntry(RQAPI.ApiEntryType.HTTP) as RQAPI.HttpApiEntry;
    entry.type = RQAPI.ApiEntryType.HTTP;
    try {
      const urlObj = new URL(request.url);
      const searchParams = Object.fromEntries(new URLSearchParams(urlObj.search));
      urlObj.search = "";

      entry.request.url = urlObj.toString();
      entry.request.queryParams = generateKeyValuePairs(searchParams);
    } catch {
      // Fails in case of relative urls.
      // Fallback to just using the url as is.
      entry.request.url = request.url;
      entry.request.queryParams = [];
    }
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
    return createDummyApiRecord(entry);
  }, [request]);

  if (!apiRecord.data) {
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
          <ContextId id={NoopContextId}>
            <AutogenerateProvider>
              <ClientViewFactory
                isOpenInModal
                apiRecord={apiRecord}
                handleRequestFinished={() => {}}
                onSaveCallback={() => {}}
                isCreateMode={true}
              />
            </AutogenerateProvider>
          </ContextId>
        </BottomSheetProvider>
      </WindowsAndLinuxGatedHoc>
    </Modal>
  );
};
