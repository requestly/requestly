import { Input, Modal, Tooltip } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { parseCurlRequest } from "../../../utils";
import { RQAPI } from "../../../../../types";
import { toast } from "utils/Toast";
import {
  trackCurlImportFailed,
  trackCurlImported,
  trackCurlImportModalOpened,
} from "modules/analytics/events/features/apiClient";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import { getDomainFromURL } from "utils/URLUtils";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import LINKS from "config/constants/sub/links";
import "./importFromCurlModal.scss";

interface Props {
  isOpen: boolean;
  isRequestLoading: boolean;
  handleImportRequest: (request: RQAPI.Request) => void;
  onClose: () => void;
  initialCurlCommand?: string;
  source?: string; // temp fix
  pageURL?: string; // temp fix
}

export const ImportFromCurlModal: React.FC<Props> = ({
  isOpen,
  handleImportRequest,
  onClose,
  isRequestLoading,
  initialCurlCommand,
  source = "",
  pageURL = "",
}) => {
  const [curlCommand, setCurlCommand] = useState(initialCurlCommand ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !curlCommand && initialCurlCommand) {
      setCurlCommand(initialCurlCommand);
    }
    // exclude curlCommand to avoid re-firing while typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCurlCommand]);

  useEffect(() => {
    if (isOpen) {
      trackCurlImportModalOpened({
        source,
        page_domain: getDomainFromURL(pageURL),
      });
      inputRef.current?.focus();
    }
  }, [isOpen, source, pageURL]);

  const onImportClicked = useCallback(() => {
    if (!curlCommand) {
      setError("Please enter a valid cURL command");
      inputRef.current?.focus();
      return;
    }

    try {
      const requestFromCurl: RQAPI.Request = parseCurlRequest(curlCommand);

      if (!requestFromCurl || !requestFromCurl.url) {
        toast.error("Could not process the cURL command");
        trackCurlImportFailed();
        return;
      }

      handleImportRequest(requestFromCurl);
      trackCurlImported();
      setCurlCommand("");
      setError(null);
      trackRQLastActivity(API_CLIENT.CURL_IMPORTED);
      trackRQDesktopLastActivity(API_CLIENT.CURL_IMPORTED);
    } catch (error) {
      trackCurlImportFailed();
      setError(error?.message || "Could not process the cURL command");
    }
  }, [curlCommand, handleImportRequest]);

  const handleClose = () => {
    setError(null);
    setCurlCommand("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      className="import-modal import-curl-modal"
      centered
      title={
        <span className="import-curl-modal-title">
          Import from cURL
          <Tooltip title="Learn more about importing from cURL">
            <a href={LINKS.REQUESTLY_API_CLIENT_IMPORT_CURL_DOCS} target="_blank" rel="noreferrer">
              <MdInfoOutline className="import-curl-modal-info-icon" />
            </a>
          </Tooltip>
        </span>
      }
      open={isOpen}
      okText="Import"
      onOk={onImportClicked}
      maskClosable={false}
      confirmLoading={isRequestLoading}
      onCancel={handleClose}
      width="70%"
    >
      {error ? (
        <pre className="curl-import-errror">
          <code>{error}</code>
        </pre>
      ) : null}
      <Input.TextArea
        ref={inputRef}
        className="curl-command-input"
        value={curlCommand}
        onChange={(e) => setCurlCommand(e.target.value)}
        placeholder="curl https://example.com"
        autoFocus={true}
      />
    </Modal>
  );
};
