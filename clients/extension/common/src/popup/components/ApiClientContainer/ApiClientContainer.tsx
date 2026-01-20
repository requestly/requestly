import { Row } from "antd";
import React from "react";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import config from "src/config";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import ApiRequest from "../../../../resources/icons/api-request.svg";
import ImportCurl from "../../../../resources/icons/curl-import.svg";
import "./apiClientContainer.scss";
import { EXTENSION_MESSAGES } from "src/constants";

export const ApiClientContainer: React.FC = () => {
  return (
    <div className="apiclient-view-container popup-body-card">
      <Row align="middle" justify="space-between">
        <div className="title">🚀{"  "}Try a simple and powerful API client</div>
      </Row>
      <Row wrap={false} align="middle" className="action-btns">
        <PrimaryActionButton
          block
          className={"api-client-action-btn"}
          icon={<ApiRequest />}
          onClick={() => window.open(`${config.WEB_URL}/api-client/request/new?source=popup`, "_blank")}
        >
          Send API request
        </PrimaryActionButton>

        <PrimaryActionButton
          block
          className={"api-client-action-btn"}
          icon={<ImportCurl />}
          onClick={() =>
            chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.TRIGGER_OPEN_CURL_MODAL, source: "popup" })
          }
        >
          Import a cURL request
        </PrimaryActionButton>
      </Row>
      <div
        className="view-more-options-link"
        onClick={() => {
          window.open(`${config.WEB_URL}/api-client?source=popup`, "_blank");
        }}
      >
        Open API Client <ExternalLinkIcon />
      </div>
    </div>
  );
};
