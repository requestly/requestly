import React, { useEffect, useMemo, useState } from "react";
import { Popconfirm, Radio, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";
//@ts-ignore
import { ReactComponent as DesktopIcon } from "assets/icons/desktop.svg";
import { ResponseRule, ResponseRuleResourceType } from "types/rules";
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

interface ResponseRuleResourceTypesProps {
  currentlySelectedRuleData: ResponseRule;
  responseRuleResourceType: ResponseRuleResourceType;
  setResponseRuleResourceType: (type: ResponseRuleResourceType) => void;
}

let i = 0;

const ResponseRuleResourceTypes: React.FC<ResponseRuleResourceTypesProps> = ({
  currentlySelectedRuleData,
  responseRuleResourceType,
  setResponseRuleResourceType,
}) => {
  const [resourceType, setResourceType] = useState<ResponseRuleResourceType>(
    ResponseRuleResourceType.UNKNOWN
  );
  const [
    responseTypePopupVisible,
    setResponseTypePopupVisible,
  ] = useState<boolean>(false);

  const isDesktop = useMemo(isDesktopMode, []);

  // useEffect(() => {
  //   const resourceType =
  //     currentlySelectedRuleData?.pairs?.[0].response?.resourceType;

  //   console.log("logging :: rendering :: ", i++, resourceType);

  //   if (resourceType) {
  //     // setResponseRuleResourceType(resourceType);
  //   }
  // }, [currentlySelectedRuleData, setResponseRuleResourceType]);

  const handleOnConfirm = () => {
    setResponseTypePopupVisible(false);
    setResponseRuleResourceType(resourceType);
  };

  const handleResourceTypeChange = (type: ResponseRuleResourceType) => {
    if (responseRuleResourceType === ResponseRuleResourceType.UNKNOWN) {
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
            <Radio value={ResponseRuleResourceType.REST_API}>Rest API</Radio>
            <Radio value={ResponseRuleResourceType.GRAPHQL_API}>
              GraphQL API
            </Radio>
            {isDesktop ? (
              <Radio value={ResponseRuleResourceType.HTML_BODY}>
                HTML Body
              </Radio>
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
                <Radio
                  disabled={!isDesktop}
                  value={ResponseRuleResourceType.HTML_BODY}
                >
                  HTML Body
                  <QuestionCircleOutlined className="resource-disable-option-info-icon" />
                </Radio>
              </Tooltip>
            )}
            {isDesktop ? (
              <Radio value={ResponseRuleResourceType.JS_OR_CSS}>JS/CSS</Radio>
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
                <Radio
                  disabled={!isDesktop}
                  value={ResponseRuleResourceType.JS_OR_CSS}
                >
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
