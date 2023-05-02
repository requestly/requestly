import { Modal } from "antd";
import React, { useMemo } from "react";
import {
  generateKeyValuePairsFromJson,
  getContentTypeFromHeaders,
  getEmptyAPIEntry,
  parseCurlRequest,
} from "views/features/apis/apiUtils";
import APIClientView from "views/features/apis/client/APIClientView";
import { RQAPI, RequestContentType, RequestMethod } from "views/features/apis/types";
import { APIClientRequest } from "./types";
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
      return { request: parseCurlRequest(request), response: null };
    }

    const entry: RQAPI.Entry = getEmptyAPIEntry();
    const urlObj = new URL(request.url);
    const searchParams = Object.fromEntries(new URLSearchParams(urlObj.search));
    urlObj.search = "";

    entry.request.url = urlObj.toString();
    entry.request.queryParams = generateKeyValuePairsFromJson(searchParams);
    entry.request.headers = generateKeyValuePairsFromJson(request.headers);
    entry.request.method = request.method || RequestMethod.GET;
    entry.request.contentType = getContentTypeFromHeaders(entry.request.headers);

    if (typeof request.body === "string") {
      entry.request.body = request.body;
    } else if (request.body instanceof FormData) {
      if (entry.request.contentType !== RequestContentType.FORM) {
        entry.request.contentType = RequestContentType.FORM;
        entry.request.headers.push({
          key: "Content-Type",
          value: RequestContentType.FORM,
          id: Math.random(),
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
      title={modalTitle || "API Client"}
      open={isModalOpen}
      onCancel={onModalClose}
      footer={null}
      width="70%"
      destroyOnClose
    >
      <APIClientView apiEntry={apiEntry} />
    </Modal>
  ) : (
    <APIClientView apiEntry={apiEntry} />
  );
};

export default APIClient;
