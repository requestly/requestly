import React, { useMemo } from "react";
import { Tooltip } from "antd";
import config from "../../../config";
import { icons } from "../../ruleTypeIcons";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { EVENT, sendEvent } from "../../events";
import "./httpsRuleOptions.css";

export const HttpsRuleOptions: React.FC = () => {
  const ruleList = useMemo(
    () => [
      {
        icon: icons.Response,
        title: "Modify API responses",
        editorLink: `${config.WEB_URL}/rules/editor/create/Response?source=popup`,
        tooltipTitle: "Modify response of any XHR/Fetch request",
      },
      {
        icon: icons.Redirect,
        title: "Redirect requests",
        editorLink: `${config.WEB_URL}/rules/editor/create/Redirect?source=popup`,
        tooltipTitle: "Map Local or Redirect a matching pattern to another URL",
      },
      {
        icon: icons.Headers,
        title: "Modify headers",
        editorLink: `${config.WEB_URL}/rules/editor/create/Headers?source=popup`,
        tooltipTitle: "Modify HTTP request & response headers",
      },
      {
        icon: icons.Replace,
        title: "Replace string",
        editorLink: `${config.WEB_URL}/rules/editor/create/Replace?source=popup`,
        tooltipTitle: "Replace parts of URL like hostname, query value",
      },
    ],
    []
  );

  return (
    <div className="https-rule-options-container">
      <div className="title">Intercept and modify HTTP(s) requests</div>
      <div className="options">
        {ruleList.map(({ icon, title, editorLink, tooltipTitle }, index) => (
          <Tooltip key={index} arrow={null} placement="top" title={tooltipTitle} overlayClassName="action-btn-tooltip">
            <PrimaryActionButton block icon={icon} onClick={() => window.open(editorLink, "_blank")}>
              {title}
            </PrimaryActionButton>
          </Tooltip>
        ))}
      </div>
      <div
        className="view-more-options-link"
        onClick={() => {
          sendEvent(EVENT.EXTENSION_VIEW_ALL_MODIFICATIONS_CLICKED);
          window.open(`${config.WEB_URL}/rules/create?source=popup`, "_blank");
        }}
      >
        View more options <ExternalLinkIcon />
      </div>
    </div>
  );
};
