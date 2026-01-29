import { Modal } from "antd";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { WindowsAndLinuxGatedHoc } from "componentsV2/WindowsAndLinuxGatedHoc";
import { AISessionProvider } from "features/ai/contexts/AISession";
import { FakeWorkspaceStoreProvider } from "features/apiClient/common/WorkspaceProvider";
import { FakeModalHostContextProvider } from "features/apiClient/common/modalHostContext";
import { CONTENT_TYPE_HEADER } from "features/apiClient/constants";
import { ClientViewFactory } from "features/apiClient/screens/apiClient/clientView/ClientViewFactory";
import {
  filterHeadersToImport,
  generateKeyValuePairs,
  generateMultipartFormKeyValuePairs,
  getContentTypeFromRequestHeaders,
  getEmptyApiEntry,
  parseCurlRequest,
  parseMultipartFormDataString,
} from "features/apiClient/screens/apiClient/utils";
import { bufferActions } from "features/apiClient/slices/buffer";
import { createFakeStore } from "features/apiClient/slices/buffer/fake-store";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useOriginUndefinedBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import React, { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import "./apiClient.scss";
import { APIClientRequest } from "./types";

interface Props {
  request: string | APIClientRequest; // string for cURL request
  isModalOpen?: boolean;
  onModalClose?: () => void;
  modalTitle?: string;
}

export const createDummyApiRecord = (apiEntry: RQAPI.ApiEntry): RQAPI.ApiRecord => {
  // This record is created only for cases when client view is opened without any option to save the request.
  // if saving is enabled in such cases, please take the necessary fields into account (eg. id, ownerId...).
  return {
    id: uuidv4(), // Generated ID to ensure ID is always present
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

const buildApiRecordFromRequest = (request: string | APIClientRequest | undefined): RQAPI.ApiRecord => {
  if (!request) {
    return createDummyApiRecord(getEmptyApiEntry(RQAPI.ApiEntryType.HTTP));
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
  entry.request.contentType = getContentTypeFromRequestHeaders(entry.request.headers) ?? RequestContentType.RAW;

  if (typeof request.body === "string") {
    entry.request.body = request.body;

    if (entry.request.contentType === RequestContentType.FORM) {
      const searchParams = new URLSearchParams(request.body);
      entry.request.body = generateKeyValuePairs(Object.fromEntries(searchParams));
    } else if (entry.request.contentType === RequestContentType.MULTIPART_FORM) {
      const contentTypeHeaderValue = entry.request.headers.find(
        (h) => h.key.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase()
      )?.value;
      const parsedParts = parseMultipartFormDataString(request.body, contentTypeHeaderValue ?? null);
      const multipartData = parsedParts.map(({ key, value, isFile, fileName }) => ({
        key,
        //The @ prefix is not a standard multipart form-data thing.
        // It's a cURL convention used to indicate file uploads in command-line cURL requests.
        // Using it here to maintain consistency with cURL import/export and to reuse the same util
        value: isFile && fileName ? `@${fileName}` : value,
      }));
      entry.request.body = generateMultipartFormKeyValuePairs(multipartData);
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
};

const ClientViewContent: React.FC<{ bufferId: string; onRequestFinished: () => void }> = ({
  bufferId,
  onRequestFinished,
}) => {
  const entity = useOriginUndefinedBufferedEntity<ApiClientEntityType.HTTP_RECORD>({
    bufferId,
  });

  return <ClientViewFactory entity={entity as BufferedHttpRecordEntity} handleRequestFinished={onRequestFinished} isOpenInModal />;
};

const ApiClientSession: React.FC<{
  apiRecord: RQAPI.ApiRecord;
  onModalClose?: () => void;
}> = ({ apiRecord, onModalClose }) => {
  const bufferId = useMemo(() => uuidv4(), []);
  
    const fakeStore = useMemo(() => {
      const store = createFakeStore();
  
      store.dispatch(
        bufferActions.open(
          {
            entityType: ApiClientEntityType.HTTP_RECORD,
            isNew: false,
            referenceId: apiRecord.id,
            data: apiRecord,
          },
          {
            id: bufferId,
          }
        )
      );
  
      return store;
    }, [apiRecord, bufferId]);

  return (
    <FakeModalHostContextProvider onClose={onModalClose}>
      <WindowsAndLinuxGatedHoc featureName="API client">
        <BottomSheetProvider context={BottomSheetFeatureContext.API_CLIENT}>
          <AISessionProvider>
            <FakeWorkspaceStoreProvider store={fakeStore}>
              <ClientViewContent bufferId={bufferId} onRequestFinished={() => {}} />
            </FakeWorkspaceStoreProvider>
          </AISessionProvider>
        </BottomSheetProvider>
      </WindowsAndLinuxGatedHoc>
    </FakeModalHostContextProvider>
  );
};

export const APIClientModal: React.FC<Props> = ({ request, isModalOpen, onModalClose, modalTitle }) => {
  const apiRecord = useMemo(() => buildApiRecordFromRequest(request), [request]);
  const hasApiData = Boolean(apiRecord.data);

  if (!hasApiData) {
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
      <ApiClientSession apiRecord={apiRecord} onModalClose={onModalClose} />
    </Modal>
  );
};