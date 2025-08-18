import { Row } from "antd";
import React from "react";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import config from "src/config";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import ApiRequest from "../../../../resources/icons/api-request.svg";
import ImportCurl from "../../../../resources/icons/curl-import.svg";
import "./apiClient.scss";

export const ApiClientView: React.FC = () => {
  return (
    <div className="apiclient-view-container popup-body-card">
      <Row align="middle" justify="space-between">
        <div className="title">🚀 Try a simple and powerful API client</div>
      </Row>
      <Row wrap={false} align="middle" className="action-btns">
        <PrimaryActionButton
          block
          className={""}
          icon={<ApiRequest />}
          onClick={() => console.log("Send API request clicked")}
        >
          Send API request
        </PrimaryActionButton>

        <PrimaryActionButton block icon={<ImportCurl />} onClick={() => console.log("Import cURL request clicked")}>
          Import a cURL request
        </PrimaryActionButton>
      </Row>
      <div
        className="view-more-options-link"
        onClick={() => {
          window.open(`${config.WEB_URL}/api-client`, "_blank");
        }}
      >
        Open API Client <ExternalLinkIcon />
      </div>
    </div>
  );
};
