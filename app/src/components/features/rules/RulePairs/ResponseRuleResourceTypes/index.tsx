import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Radio, Tooltip } from "antd";
import { getCurrentlySelectedRuleData, getResponseRuleResourceType } from "store/selectors";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { setCurrentlySelectedRule } from "../../RuleBuilder/actions";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";
//@ts-ignore
import { ReactComponent as DesktopIcon } from "assets/icons/desktop.svg";
import { omit, set } from "lodash";
import { ResponseRuleResourceType } from "types/rules";
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

const ResponseRuleResourceTypes: React.FC = () => {
  const dispatch = useDispatch();
  const isDesktop = useMemo(isDesktopMode, []);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);

  const requestPayloadFilter = currentlySelectedRuleData.pairs?.[0].source?.filters?.[0]?.requestPayload;

  const updateResourceType = useCallback(
    (resourceType: ResponseRuleResourceType, clearGraphqlRequestPayload = false) => {
      const pairIndex = 0; // response rule will only have one pair
      const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));

      let updatedPair = set(copyOfCurrentlySelectedRule?.pairs?.[pairIndex], "response.resourceType", resourceType);

      if (clearGraphqlRequestPayload) {
        // clear graphql request payload on resource type change
        updatedPair = omit(updatedPair, ["source.filters[0].requestPayload"]);
      }

      const updatedRule = {
        ...currentlySelectedRuleData,
        pairs: [{ ...updatedPair }],
      };

      setCurrentlySelectedRule(dispatch, updatedRule, resourceType !== ResponseRuleResourceType.UNKNOWN);
    },
    [dispatch, currentlySelectedRuleData]
  );

  const isNewResponseRule = "resourceType" in (currentlySelectedRuleData?.pairs?.[0]?.response ?? {});

  useEffect(() => {
    if (isNewResponseRule) return;

    // legacy rules will have "unknown" resource type
    updateResourceType(ResponseRuleResourceType.UNKNOWN);
  }, [isNewResponseRule, requestPayloadFilter, updateResourceType]);

  const handleResourceTypeChange = (type: ResponseRuleResourceType) => {
    const clearGraphqlRequestPayload = type !== ResponseRuleResourceType.GRAPHQL_API;

    updateResourceType(type, clearGraphqlRequestPayload);
  };

  return isNewResponseRule && responseRuleResourceType !== ResponseRuleResourceType.UNKNOWN ? (
    <div className="resource-types-container" data-tour-id="rule-editor-response-resource-type">
      <div className="subtitle">Select Resource Type</div>
      <div className="resource-types-radio-group">
        <Radio.Group value={responseRuleResourceType} onChange={(e) => handleResourceTypeChange(e.target.value)}>
          <Radio value={ResponseRuleResourceType.REST_API}>REST API</Radio>
          <Radio value={ResponseRuleResourceType.GRAPHQL_API}>GraphQL API</Radio>
          {isDesktop ? (
            <Radio value={ResponseRuleResourceType.STATIC}>HTML / JS / CSS</Radio>
          ) : (
            <Tooltip
              overlayClassName="response-rule-resource-type-tooltip"
              title={
                <span>
                  This option is available only in desktop app due to technical constraints of chrome extension.{" "}
                  <DownloadDesktopAppLink />
                </span>
              }
            >
              <Radio disabled={!isDesktop} value={ResponseRuleResourceType.STATIC}>
                HTML / JS / CSS
                <QuestionCircleOutlined className="resource-disable-option-info-icon" />
              </Radio>
            </Tooltip>
          )}
        </Radio.Group>
      </div>
    </div>
  ) : null;
};

export default ResponseRuleResourceTypes;
