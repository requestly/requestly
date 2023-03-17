import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Popconfirm, Radio, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { setCurrentlySelectedRule } from "../../RuleBuilder/actions";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";
//@ts-ignore
import { ReactComponent as DesktopIcon } from "assets/icons/desktop.svg";
import { omit, set } from "lodash";
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

const ResponseRuleResourceTypes: React.FC<ResponseRuleResourceTypesProps> = ({
  currentlySelectedRuleData,
  responseRuleResourceType,
  setResponseRuleResourceType,
}) => {
  const dispatch = useDispatch();
  const isDesktop = useMemo(isDesktopMode, []);
  const currentResourceType =
    currentlySelectedRuleData?.pairs?.[0]?.response?.resourceType;

  const [resourceType, setResourceType] = useState<ResponseRuleResourceType>(
    currentResourceType ?? ResponseRuleResourceType.UNKNOWN
  );
  const [
    responseTypePopupVisible,
    setResponseTypePopupVisible,
  ] = useState<boolean>(false);

  const requestPayloadFilter =
    currentlySelectedRuleData.pairs?.[0].source?.filters?.[0]?.requestPayload;

  const isPopConfirmDisabled =
    currentResourceType !== ResponseRuleResourceType.GRAPHQL_API ||
    Object.keys(requestPayloadFilter ?? {}).length === 0;

  useEffect(() => {
    if (currentResourceType) {
      setResponseRuleResourceType(currentResourceType);
    }
  }, [currentResourceType, setResponseRuleResourceType]);

  const updateResourceType = useCallback(
    (
      resourceType: ResponseRuleResourceType,
      clearGraphqlRequestPayload = false
    ) => {
      const pairIndex = 0; // response rule will only have one pair
      const copyOfCurrentlySelectedRule = JSON.parse(
        JSON.stringify(currentlySelectedRuleData)
      );

      let updatedPair = set(
        copyOfCurrentlySelectedRule.pairs[pairIndex],
        "response.resourceType",
        resourceType
      );

      if (clearGraphqlRequestPayload) {
        // clear graphql request payload on resource type change
        updatedPair = omit(updatedPair, ["source.filters[0].requestPayload"]);
      }

      const updatedRule = {
        ...currentlySelectedRuleData,
        pairs: [{ ...updatedPair }],
      };

      setCurrentlySelectedRule(dispatch, updatedRule, true);
    },
    [dispatch, currentlySelectedRuleData]
  );

  const isNewResponseRule = !!currentResourceType;

  useEffect(() => {
    if (isNewResponseRule) return;

    // legacy rules will have "unknown" resource type
    updateResourceType(ResponseRuleResourceType.UNKNOWN);
  }, [isNewResponseRule, requestPayloadFilter, updateResourceType]);

  const handleOnConfirm = () => {
    const clearGraphqlRequestPayload =
      resourceType !== ResponseRuleResourceType.GRAPHQL_API;

    setResponseTypePopupVisible(false);
    setResponseRuleResourceType(resourceType);
    updateResourceType(resourceType, clearGraphqlRequestPayload);
  };

  const handleResourceTypeChange = (type: ResponseRuleResourceType) => {
    if (isPopConfirmDisabled) {
      setResourceType(type);
      setResponseRuleResourceType(type);
      updateResourceType(type);
      return;
    }

    setResponseTypePopupVisible(true);
    setResourceType(type);
  };

  return isNewResponseRule &&
    currentResourceType !== ResponseRuleResourceType.UNKNOWN ? (
    <div className="resource-types-container">
      <div className="subtitle">Select Resource Type</div>
      <div className="resource-types-radio-group">
        <Popconfirm
          title="This will clear the existing GraphQL operation data"
          okText="Confirm"
          cancelText="Cancel"
          placement="topLeft"
          open={responseTypePopupVisible}
          onConfirm={handleOnConfirm}
          disabled={isPopConfirmDisabled}
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
              <Radio value={ResponseRuleResourceType.STATIC}>
                HTML / JS / CSS
              </Radio>
            ) : (
              <Tooltip
                overlayClassName="response-rule-resource-type-tooltip"
                title={
                  <span>
                    This option is available only in desktop app due to
                    technical constraints of chrome extension.{" "}
                    <DownloadDesktopAppLink />
                  </span>
                }
              >
                <Radio
                  disabled={!isDesktop}
                  value={ResponseRuleResourceType.STATIC}
                >
                  HTML / JS / CSS
                  <QuestionCircleOutlined className="resource-disable-option-info-icon" />
                </Radio>
              </Tooltip>
            )}
          </Radio.Group>
        </Popconfirm>
      </div>
    </div>
  ) : null;
};

export default ResponseRuleResourceTypes;
