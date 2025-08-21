import React, { useMemo } from "react";
import { Tooltip } from "antd";
import config from "../../../config";
import { icons } from "../../ruleTypeIcons";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { EVENT, sendEvent } from "../../events";
import { RuleType } from "../../../types";
import "./httpsRuleOptions.css";

export const HttpsRuleOptions: React.FC = () => {
  const ruleList = useMemo(
    () => [
      {
        icon: icons.Response,
        ruleType: RuleType.RESPONSE,
        title: "Modify API responses",
        editorLink: `${config.WEB_URL}/rules/editor/create/Response?source=popup`,
        tooltipTitle: "Modify response of any XHR/Fetch request",
      },
      {
        icon: icons.Redirect,
        ruleType: RuleType.REDIRECT,
        title: "Redirect requests",
        editorLink: `${config.WEB_URL}/rules/editor/create/Redirect?source=popup`,
        tooltipTitle: "Map Local or Redirect a matching pattern to another URL",
      },
      {
        icon: icons.Headers,
        ruleType: RuleType.HEADERS,
        title: "Modify headers",
        editorLink: `${config.WEB_URL}/rules/editor/create/Headers?source=popup`,
        tooltipTitle: "Modify HTTP request & response headers",
      },
      {
        icon: icons.Replace,
        ruleType: RuleType.REPLACE,
        title: "Replace string",
        editorLink: `${config.WEB_URL}/rules/editor/create/Replace?source=popup`,
        tooltipTitle: "Replace parts of URL like hostname, query value",
      },
    ],
    []
  );

  return (
    <div className="https-rule-options-container popup-body-card">
      <div className="title">Intercept and modify web traffic</div>
      <div className="options">
        {ruleList.map(({ icon, title, editorLink, tooltipTitle, ruleType }, index) => (
          <Tooltip
            key={index}
            color="#000000"
            placement="top"
            title={tooltipTitle}
            overlayClassName="action-btn-tooltip"
          >
            <PrimaryActionButton
              block
              icon={icon}
              onClick={() => {
                sendEvent(EVENT.RULE_CREATION_WORKFLOW_STARTED, { rule_type: ruleType });
                window.open(editorLink, "_blank");
              }}
            >
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
