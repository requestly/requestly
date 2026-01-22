import { Modal, Spin } from "antd";
import React, { useEffect, useMemo, useState } from "react";
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
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import "./apiClient.scss";
import { WindowsAndLinuxGatedHoc } from "componentsV2/WindowsAndLinuxGatedHoc";
import { ClientViewFactory } from "features/apiClient/screens/apiClient/clientView/ClientViewFactory";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { AISessionProvider } from "features/ai/contexts/AISession";
import { useOriginUndefinedBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { bufferAdapterSelectors } from "features/apiClient/slices/buffer/slice";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import { apiClientContextRegistry } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";
import { apiClientContextService } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextService";
import { getWorkspaceInfo } from "features/apiClient/slices/workspaceView/utils";
import { HostContextImpl, HostContext } from "hooks/useHostContext";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import type { UserDetails } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextService/ApiClientContextService";

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

interface BufferedClientViewProps {
  bufferId: string;
}

const BufferedClientView: React.FC<BufferedClientViewProps> = ({ bufferId }) => {
  const entity = useOriginUndefinedBufferedEntity<ApiClientEntityType.HTTP_RECORD | ApiClientEntityType.GRAPHQL_RECORD>(
    { bufferId }
  );

  return (
    <ClientViewFactory
      isOpenInModal
      entity={entity as BufferedHttpRecordEntity | BufferedGraphQLRecordEntity}
      handleRequestFinished={() => {}}
    />
  );
};

interface APIClientModalContentProps {
  apiRecord: RQAPI.ApiRecord;
}

/**
 * Creates a minimal HostContext for modal usage.
 * Modal is always "active" when open, and other tab operations are no-ops.
 */
const createModalHostContext = (onClose?: () => void): HostContext => ({
  close: () => {
    onClose?.();
  },
  replace: () => {
    // No-op in modal context
  },
  getIsActive: () => true, // Modal is always active when open
  getSourceId: () => undefined,
  getBufferId: () => undefined,
  registerWorkflow: () => {
    // No-op in modal context
  },
  registerSecondaryBuffer: () => {
    // No-op in modal context
  },
  unregisterSecondaryBuffer: () => {
    // No-op in modal context
  },
});

/**
 * Inner component that requires the WorkspaceProvider and HostContext.
 * Handles buffer creation/cleanup and renders the client view.
 */
const APIClientModalContent: React.FC<APIClientModalContentProps> = ({ apiRecord }) => {
  const dispatch = useApiClientDispatch();
  const [bufferId, setBufferId] = useState<string | null>(null);

  const bufferExists = useApiClientSelector((state) =>
    bufferId ? bufferAdapterSelectors.selectById(state.buffer, bufferId) !== undefined : false
  );

  useEffect(() => {
    if (!apiRecord.data) {
      return;
    }

    const action = bufferActions.open(
      {
        entityType: ApiClientEntityType.HTTP_RECORD,
        isNew: true,
        data: apiRecord,
      },
      { id: undefined }
    );

    dispatch(action);
    setBufferId(action.meta.id);

    return () => {
      dispatch(bufferActions.close(action.meta.id));
      setBufferId(null);
    };
  }, [apiRecord, dispatch]);

  if (!bufferId || !bufferExists) {
    return null;
  }

  return <BufferedClientView bufferId={bufferId} />;
};

// Its okay if we dont open GraphQL request from network table
export const APIClientModal: React.FC<Props> = ({ request, isModalOpen, onModalClose, modalTitle }) => {
  const apiRecord = useMemo(() => buildApiRecordFromRequest(request), [request]);

  // Global app store (not API client store)
  const activeWorkspace = useSelector(getActiveWorkspace);
  const userAuth = useSelector(getUserAuthDetails);

  const hasApiData = Boolean(apiRecord.data);

  const workspaceInfo = useMemo(() => getWorkspaceInfo(activeWorkspace), [activeWorkspace]);
  const userDetails: UserDetails = useMemo(() => {
    const uid = userAuth?.details?.profile?.uid;
    return uid ? { uid, loggedIn: true } : { loggedIn: false };
  }, [userAuth]);

  const [contextInit, setContextInit] = useState<{ status: "idle" | "loading" | "ready" | "error"; error?: Error }>(
    () => ({ status: "idle" })
  );

  useEffect(() => {
    if (!isModalOpen || !hasApiData) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const existing = apiClientContextRegistry.getContext(workspaceInfo.id);
        if (existing) {
          if (!cancelled) setContextInit({ status: "ready" });
          return;
        }

        if (!cancelled) setContextInit({ status: "loading" });

        // Lazily initialize ApiClient context/store for this workspace.
        await apiClientContextService.createContext(workspaceInfo, userDetails);

        if (!cancelled) setContextInit({ status: "ready" });
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        if (!cancelled) setContextInit({ status: "error", error });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isModalOpen, hasApiData, workspaceInfo, userDetails]);

  // Hooks must run unconditionally; keep the early return down here.
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
      {!isModalOpen ? null : contextInit.status === "error" ? (
        <div style={{ padding: 24 }}>
          Failed to load API Client.
          <div style={{ opacity: 0.7, marginTop: 8 }}>{contextInit.error?.message}</div>
        </div>
      ) : contextInit.status !== "ready" ? (
        <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
          <Spin />
        </div>
      ) : (
        <HostContextImpl.Provider value={createModalHostContext(onModalClose)}>
          <WorkspaceProvider workspaceId={workspaceInfo.id}>
            <WindowsAndLinuxGatedHoc featureName="API client">
              <BottomSheetProvider context={BottomSheetFeatureContext.API_CLIENT}>
                <AISessionProvider>
                  <APIClientModalContent apiRecord={apiRecord} />
                </AISessionProvider>
              </BottomSheetProvider>
            </WindowsAndLinuxGatedHoc>
          </WorkspaceProvider>
        </HostContextImpl.Provider>
      )}
    </Modal>
  );
};
