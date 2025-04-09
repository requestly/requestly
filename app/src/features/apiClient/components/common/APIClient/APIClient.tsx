import { Modal } from "antd";
import React, { useMemo } from "react";
import { APIClientRequest } from "./types";
import BetaBadge from "components/misc/BetaBadge";
import { QueryParamSyncType, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import {
  filterHeadersToImport,
  generateKeyValuePairsFromJson,
  getContentTypeFromRequestHeaders,
  getEmptyAPIEntry,
  parseCurlRequest,
  syncQueryParams,
} from "features/apiClient/screens/apiClient/utils";
import { CONTENT_TYPE_HEADER } from "features/apiClient/constants";
import APIClientView from "../../../screens/apiClient/components/clientView/APIClientView";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import "./apiClient.scss";
import { isEmpty } from "lodash";

interface Props {
  request: string | APIClientRequest; // string for cURL request
  openInModal?: boolean;
  isModalOpen?: boolean;
  onModalClose?: () => void;
  modalTitle?: string;
}

const APIClient: React.FC<Props> = ({ request, openInModal, isModalOpen, onModalClose, modalTitle }) => {
  const apiEntry = useMemo<RQAPI.Entry>(() => {
    if (!request) {
      return null;
    }

    if (typeof request === "string") {
      return getEmptyAPIEntry(parseCurlRequest(request));
    }

    const entry: RQAPI.Entry = getEmptyAPIEntry();
    const urlObj = new URL(request.url);
    const searchParams = Object.fromEntries(new URLSearchParams(urlObj.search));
    urlObj.search = "";

    entry.request.url = urlObj.toString();
    entry.request.queryParams = generateKeyValuePairsFromJson(searchParams);
    entry.request.headers = filterHeadersToImport(generateKeyValuePairsFromJson(request.headers));
    entry.request.method = (request.method as RequestMethod) || RequestMethod.GET;
    entry.request.contentType = getContentTypeFromRequestHeaders(entry.request.headers);

    if (typeof request.body === "string") {
      entry.request.body = request.body;

      if (entry.request.contentType === RequestContentType.FORM) {
        const searchParams = new URLSearchParams(request.body);
        entry.request.body = generateKeyValuePairsFromJson(Object.fromEntries(searchParams));
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
        entry.request.body = generateKeyValuePairsFromJson(formDataObj);
      }
    }

    entry.request = {
      ...entry.request,
      ...syncQueryParams(
        entry.request.queryParams,
        entry.request.url,
        isEmpty(entry.request.queryParams) ? QueryParamSyncType.TABLE : QueryParamSyncType.SYNC
      ),
    };

    return entry;
  }, [request]);

  if (!apiEntry) {
    return null;
  }

  return openInModal ? (
    <Modal
      className="api-client-modal"
      centered
      title={<BetaBadge text={modalTitle || "API Client"} />}
      open={isModalOpen}
      onCancel={onModalClose}
      footer={null}
      width="70%"
      destroyOnClose
    >
      <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM}>
        <APIClientView isCreateMode={true} apiEntryDetails={{ data: apiEntry }} openInModal={openInModal} />
      </BottomSheetProvider>
    </Modal>
  ) : (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM}>
      <APIClientView isCreateMode={true} apiEntryDetails={{ data: apiEntry }} />
    </BottomSheetProvider>
  );
};

export default APIClient;
