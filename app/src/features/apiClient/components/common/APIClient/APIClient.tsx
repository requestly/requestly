import { Modal } from "antd";
import React, { useMemo } from "react";
import { APIClientRequest } from "./types";
import BetaBadge from "components/misc/BetaBadge";
import { RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import {
  filterHeadersToImport,
  generateKeyValuePairsFromJson,
  getContentTypeFromRequestHeaders,
  getEmptyAPIEntry,
  parseCurlRequest,
} from "features/apiClient/screens/apiClient/utils";
import { CONTENT_TYPE_HEADER } from "features/apiClient/constants";
import APIClientView from "../../../screens/apiClient/components/clientView/APIClientView";
import "./apiClient.scss";

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
      <APIClientView apiEntry={apiEntry} openInModal={openInModal} />
    </Modal>
  ) : (
    <APIClientView apiEntry={apiEntry} />
  );
};

export default APIClient;
