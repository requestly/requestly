import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Radio, Row, Tooltip } from "antd";
import { getCurrentlySelectedRuleData, getRequestRuleResourceType, getResponseRuleResourceType } from "store/selectors";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { setCurrentlySelectedRule } from "../../RuleBuilder/actions";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";
import DesktopIcon from "assets/icons/desktop.svg?react";
import { omit, set } from "lodash";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import { PremiumFeature } from "features/pricing";
import { ResponseRule, RuleType } from "@requestly/shared/types/entities/rules";
import "./RequestResponseRuleResourceTypes.css";

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

const ResponseRuleResourceTypes: React.FC<{ ruleDetails: Record<string, unknown>; disabled: boolean }> = ({
  disabled,
  ruleDetails,
}) => {
  const dispatch = useDispatch();
  const isDesktop = useMemo(isDesktopMode, []);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isResponseRule = currentlySelectedRuleData?.ruleType === RuleType.RESPONSE;
  const ruleResourceType = useSelector(isResponseRule ? getResponseRuleResourceType : getRequestRuleResourceType);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const isSampleRule = currentlySelectedRuleData?.isSample;

  const requestPayloadFilter = currentlySelectedRuleData.pairs?.[0].source?.filters?.[0]?.requestPayload;

  const updateResourceType = useCallback(
    (resourceType: ResponseRule.ResourceType, clearGraphqlRequestPayload = false) => {
      const pairIndex = 0; // response rule will only have one pair
      const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));

      const ruleTypeKey = isResponseRule ? "response" : "request";
      let updatedPair = set(
        copyOfCurrentlySelectedRule?.pairs?.[pairIndex],
        `${ruleTypeKey}.resourceType`,
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

      const responseValue = updatedRule?.pairs?.[pairIndex]?.[ruleTypeKey]?.value;

      const isDefaultValue = ["", "{}", ruleDetails["RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE"]].includes(responseValue);

      setCurrentlySelectedRule(dispatch, updatedRule, !isDefaultValue);
    },
    [currentlySelectedRuleData, ruleDetails, dispatch, isResponseRule]
  );

  const isNewResponseRule = "resourceType" in (currentlySelectedRuleData?.pairs?.[0]?.response ?? {});
  const isNewRequestRule = "resourceType" in (currentlySelectedRuleData?.pairs?.[0]?.request ?? {});

  useEffect(() => {
    if (isNewResponseRule || isNewRequestRule || currentlySelectedRuleData?.ruleType === RuleType.REQUEST) return;

    // legacy rules will have "unknown" resource type
    updateResourceType(ResponseRule.ResourceType.UNKNOWN);
  }, [isNewRequestRule, isNewResponseRule, requestPayloadFilter, updateResourceType, currentlySelectedRuleData]);

  const handleResourceTypeChange = (type: ResponseRule.ResourceType) => {
    const clearGraphqlRequestPayload = type !== ResponseRule.ResourceType.GRAPHQL_API;

    updateResourceType(type, clearGraphqlRequestPayload);
  };

  const isPremiumFeature = !getFeatureLimitValue(FeatureLimitType.graphql_resource_type);

  return (isNewResponseRule || isNewRequestRule) && ruleResourceType !== ResponseRule.ResourceType.UNKNOWN ? (
    <div className="resource-types-container" data-tour-id="rule-editor-response-resource-type">
      <div className="subtitle">Select Resource Type</div>
      <div className="resource-types-radio-group">
        <Radio.Group
          disabled={isSampleRule || disabled}
          value={ruleResourceType}
          onChange={(e) => {
            if (e.target.value !== ResponseRule.ResourceType.GRAPHQL_API) handleResourceTypeChange(e.target.value);
          }}
        >
          <Radio value={ResponseRule.ResourceType.REST_API}>REST API</Radio>
          <PremiumFeature
            features={[FeatureLimitType.graphql_resource_type]}
            featureName="GraphQL API"
            popoverPlacement="top"
            onContinue={() => {
              handleResourceTypeChange(ResponseRule.ResourceType.GRAPHQL_API);
            }}
            source="graphql_resource_type"
          >
            <Radio value={ResponseRule.ResourceType.GRAPHQL_API} className="graphql-radio-item">
              <Row align="middle">
                GraphQL API {isPremiumFeature ? <PremiumIcon featureType="graphql_resource_type" /> : null}
              </Row>
            </Radio>
          </PremiumFeature>
          {isResponseRule && (
            <>
              {isDesktop ? (
                <Radio value={ResponseRule.ResourceType.STATIC}>HTML / JS / CSS</Radio>
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
                  <Radio disabled={!isDesktop || disabled} value={ResponseRule.ResourceType.STATIC}>
                    HTML / JS / CSS
                    <QuestionCircleOutlined className="resource-disable-option-info-icon" />
                  </Radio>
                </Tooltip>
              )}
            </>
          )}
        </Radio.Group>
      </div>
    </div>
  ) : null;
};

export default ResponseRuleResourceTypes;
