import React, { useMemo, useState } from "react";
import { Popconfirm, Radio, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";
//@ts-ignore
import { ReactComponent as DesktopIcon } from "assets/icons/desktop.svg";
import "./ResponseRuleResourceTypes.css";

const DownloadDesktopAppLink: React.FC = () => (
  <a
    target="_blank"
    rel="noreferrer"
    className="download-desktop-app-link"
    href={APP_CONSTANTS.LINKS.REQUESTLY_DESKTOP_APP}
  >
    <DesktopIcon /> <span>Download desktop app</span>
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
  const [resourceType, setResourceType] = useState<ResourceType>(
    ResourceType.UNKNOWN
  );
  const [
    responseTypePopupVisible,
    setResponseTypePopupVisible,
  ] = useState<boolean>(false);

  const isDesktop = useMemo(isDesktopMode, []);

  const handleOnConfirm = () => {
    setResponseTypePopupVisible(false);
    setResponseRuleResourceType(resourceType);
  };

  const handleResourceTypeChange = (type: ResourceType) => {
    if (responseRuleResourceType === ResourceType.UNKNOWN) {
      setResourceType(type);
      setResponseRuleResourceType(type);
      return;
    }

    setResponseTypePopupVisible(true);
    setResourceType(type);
  };

  return (
    <div className="resource-types-container">
      <div className="subtitle">Select Resource Type</div>
      <div className="resource-types-radio-group">
        <Popconfirm
          title="This will clear the existing body content"
          okText="Confirm"
          cancelText="Cancel"
          open={responseTypePopupVisible}
          onConfirm={handleOnConfirm}
          overlayClassName="resource-types-popconfirm"
          onCancel={() => setResponseTypePopupVisible(false)}
        >
          <Radio.Group
            value={responseRuleResourceType}
            onChange={(e) => handleResourceTypeChange(e.target.value)}
          >
            <Radio value={ResourceType.REST_API}>Rest API</Radio>
            <Radio value={ResourceType.GRAPHQL_API}>GraphQL API</Radio>
            {isDesktop ? (
              <Radio value={ResourceType.HTML_BODY}>HTML Body</Radio>
            ) : (
              <Tooltip
                overlayClassName="response-rule-resource-type-tooltip"
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
                  <QuestionCircleOutlined className="resource-disable-option-info-icon" />
                </Radio>
              </Tooltip>
            )}
            {isDesktop ? (
              <Radio value={ResourceType.JS_OR_CSS}>JS/CSS</Radio>
            ) : (
              <Tooltip
                overlayClassName="response-rule-resource-type-tooltip"
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
                  <QuestionCircleOutlined className="resource-disable-option-info-icon" />
                </Radio>
              </Tooltip>
            )}
          </Radio.Group>
        </Popconfirm>
      </div>
    </div>
  );
};

export default ResponseRuleResourceTypes;
