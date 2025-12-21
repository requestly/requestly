import { Modal } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { APIClientRequest } from "./types";
import { RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import {
  filterHeadersToImport,
  generateKeyValuePairs,
  generateMultipartFormKeyValuePairs,
  getContentTypeFromRequestHeaders,
  getEmptyApiEntry,
  parseCurlRequest,
  parseMultipartFormDataString,
} from "features/apiClient/screens/apiClient/utils";
import { CONTENT_TYPE_HEADER } from "features/apiClient/constants";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import "./apiClient.scss";
import { WindowsAndLinuxGatedHoc } from "componentsV2/WindowsAndLinuxGatedHoc";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "features/apiClient/screens/apiClient/clientView/ClientViewFactory";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { NoopContextId } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { setupContextWithoutMarkingLoaded } from "features/apiClient/commands/context";

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
  const [contextId, setContextId] = useState<string | null>(null);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const user = useSelector(getUserAuthDetails);

  const handleSaveCallback = useCallback(() => {
    // Close modal after successful save
    onModalClose?.();
  }, [onModalClose]);

  // Initialize API Client context when modal opens
  useEffect(() => {
    if (!isModalOpen || !activeWorkspace || contextId) {
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const { id } = await setupContextWithoutMarkingLoaded(activeWorkspace, {
          loggedIn: user.loggedIn,
          uid: user.details?.profile?.uid ?? "",
        });
        if (isMounted) {
          setContextId(id);
        }
      } catch (error) {
        console.error("Failed to initialize API Client context:", error);
        // Fallback to NoopContextId if initialization fails
        if (isMounted) {
          setContextId(NoopContextId);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, activeWorkspace, user.loggedIn, user.details?.profile?.uid, contextId]);

  // Reset context when modal closes
  useEffect(() => {
    if (!isModalOpen && contextId) {
      setContextId(null);
    }
  }, [isModalOpen, contextId]);

  const apiRecord = useMemo<RQAPI.ApiRecord>(() => {
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
  }, [request]);

  if (!apiRecord.data) {
    return null;
  }

  // Don't render modal content until context is initialized
  if (!contextId) {
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
          <ContextId id={contextId}>
            <AutogenerateProvider>
              <ClientViewFactory
                isOpenInModal
                apiRecord={apiRecord}
                handleRequestFinished={() => {}}
                onSaveCallback={handleSaveCallback}
                isCreateMode={true}
              />
            </AutogenerateProvider>
          </ContextId>
        </BottomSheetProvider>
      </WindowsAndLinuxGatedHoc>
    </Modal>
  );
};
