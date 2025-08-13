import { Input, Modal } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { parseCurlRequest } from "../../../utils";
import { RQAPI } from "../../../../../types";
import { toast } from "utils/Toast";
import { trackCurlImportFailed, trackCurlImported } from "modules/analytics/events/features/apiClient";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import "./importFromCurlModal.scss";

interface Props {
  isOpen: boolean;
  isRequestLoading: boolean;
  handleImportRequest: (request: RQAPI.Request) => void;
  onClose: () => void;
  initialCurlCommand?: string;
}

export const ImportFromCurlModal: React.FC<Props> = ({
  isOpen,
  handleImportRequest,
  onClose,
  isRequestLoading,
  initialCurlCommand,
}) => {
  const [curlCommand, setCurlCommand] = useState("");
  const [error, setError] = useState(null);
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Pre-fill with initial cURL command if provided
      if (initialCurlCommand) {
        setCurlCommand(initialCurlCommand);
      }
    } else {
      setCurlCommand("");
    }
  }, [isOpen, initialCurlCommand]);

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

  return (
    <Modal
      className="import-modal"
      centered
      title="Import from cURL"
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
      />
    </Modal>
  );
};
