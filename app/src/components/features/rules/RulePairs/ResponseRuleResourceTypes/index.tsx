import React, { useMemo } from "react";
import { Radio, Tooltip } from "antd";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";
//@ts-ignore
import { ReactComponent as DesktopIcon } from "assets/icons/desktop.svg";
import "./ResponseRuleResourceTypes.css";

const DownloadDesktopAppLink: React.FC = () => (
  <a
    target="_blank"
    rel="noreferrer"
    href={APP_CONSTANTS.LINKS.REQUESTLY_DESKTOP_APP}
  >
    <DesktopIcon /> Download desktop app
  </a>
);

enum ResourceType {
  UNKNOWN = "",
  REST_API = "restApi",
  GRAPHQL_API = "graphqlApi",
  HTML_BODY = "htmlBody",
  JS_OR_CSS = "jsOrCss",
}

interface ResponseRuleResourceTypesProps {
  responseRuleResourceType: ResourceType;
  setResponseRuleResourceType: (type: ResourceType) => void;
}

const ResponseRuleResourceTypes: React.FC<ResponseRuleResourceTypesProps> = ({
  responseRuleResourceType,
  setResponseRuleResourceType,
}) => {
  const isDesktop = useMemo(isDesktopMode, []);

  return (
    <div className="response-rule-resource-types">
      <div>Select Resource Type</div>
      <div>
        <Radio.Group
          value={responseRuleResourceType}
          onChange={(e) => setResponseRuleResourceType(e.target.value)}
        >
          <Radio value={ResourceType.REST_API}>Rest API</Radio>
          <Radio value={ResourceType.GRAPHQL_API}>GraphQL API</Radio>
          {isDesktop ? (
            <Radio value={ResourceType.HTML_BODY}>HTML Body</Radio>
          ) : (
            <Tooltip
              title={
                <span>
                  HTML Body option is available only in desktop app due to
                  technical constraints of chrome extension.{" "}
                  <DownloadDesktopAppLink />
                </span>
              }
            >
              <Radio value={ResourceType.HTML_BODY} disabled={!isDesktop}>
                HTML Body
              </Radio>
            </Tooltip>
          )}
          {isDesktop ? (
            <Radio value={ResourceType.JS_OR_CSS}>JS/CSS</Radio>
          ) : (
            <Tooltip
              title={
                <span>
                  JS/CSS option is available only in desktop app due to
                  technical constraints of chrome extension.{" "}
                  <DownloadDesktopAppLink />
                </span>
              }
            >
              <Radio value={ResourceType.JS_OR_CSS} disabled={!isDesktop}>
                JS/CSS
              </Radio>
            </Tooltip>
          )}
        </Radio.Group>
      </div>
    </div>
  );
};

export default ResponseRuleResourceTypes;
