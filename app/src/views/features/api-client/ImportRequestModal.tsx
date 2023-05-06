import { Input, Modal } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { parseCurlRequest } from "./apiUtils";
import { RQAPI } from "./types";
import { toast } from "utils/Toast";
import { trackCurlImportFailed, trackCurlImported } from "modules/analytics/events/features/apiClient";

interface Props {
  isOpen: boolean;
  handleImportRequest: (request: RQAPI.Request) => void;
  onClose: () => void;
}

const ImportRequestModal: React.FC<Props> = ({ isOpen, handleImportRequest, onClose }) => {
  const [curlCommand, setCurlCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setCurlCommand("");
    }
  }, [isOpen]);

  const onImportClicked = useCallback(() => {
    if (!curlCommand) {
      toast.error("Please enter the cURL command");
      inputRef.current?.focus();
      return;
    }

    const requestFromCurl: RQAPI.Request = parseCurlRequest(curlCommand);

    if (!requestFromCurl || !requestFromCurl.url) {
      toast.error("Could not process the cURL command");
      trackCurlImportFailed();
      return;
    }

    handleImportRequest(requestFromCurl);
    trackCurlImported();
  }, [curlCommand, handleImportRequest]);

  return (
    <Modal
      className="import-modal"
      centered
      title="Import from cURL"
      open={isOpen}
      okText="Import"
      onOk={onImportClicked}
      onCancel={onClose}
      width="70%"
    >
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

export default ImportRequestModal;
