import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Radio, Row, Tooltip } from "antd";
import { getCurrentlySelectedRuleData, getResponseRuleResourceType } from "store/selectors";
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
import "./ResponseRuleResourceTypes.css";
import { ResponseRule } from "@requestly/shared/types/entities/rules";

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
  const responseRuleResourceType = useSelector(getResponseRuleResourceType);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const isSampleRule = currentlySelectedRuleData?.isSample;

  const requestPayloadFilter = currentlySelectedRuleData.pairs?.[0].source?.filters?.[0]?.requestPayload;

  const updateResourceType = useCallback(
    (resourceType: ResponseRule.ResourceType, clearGraphqlRequestPayload = false) => {
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

      const responseValue = updatedRule?.pairs?.[pairIndex]?.response?.value;

      const isDefaultValue = ["", "{}", ruleDetails["RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE"]].includes(responseValue);

      setCurrentlySelectedRule(dispatch, updatedRule, !isDefaultValue);
    },
    [dispatch, currentlySelectedRuleData, ruleDetails["RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE"]]
  );

  const isNewResponseRule = "resourceType" in (currentlySelectedRuleData?.pairs?.[0]?.response ?? {});

  useEffect(() => {
    if (isNewResponseRule) return;

    // legacy rules will have "unknown" resource type
    updateResourceType(ResponseRule.ResourceType.UNKNOWN);
  }, [isNewResponseRule, requestPayloadFilter, updateResourceType]);

  const handleResourceTypeChange = (type: ResponseRule.ResourceType) => {
    const clearGraphqlRequestPayload = type !== ResponseRule.ResourceType.GRAPHQL_API;

    updateResourceType(type, clearGraphqlRequestPayload);
  };

  const isPremiumFeature = !getFeatureLimitValue(FeatureLimitType.graphql_resource_type);

  return isNewResponseRule && responseRuleResourceType !== ResponseRule.ResourceType.UNKNOWN ? (
    <div className="resource-types-container" data-tour-id="rule-editor-response-resource-type">
      <div className="subtitle">Select Resource Type</div>
      <div className="resource-types-radio-group">
        <Radio.Group
          disabled={isSampleRule || disabled}
          value={responseRuleResourceType}
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
              <Radio disabled={!isDesktop} value={ResponseRule.ResourceType.STATIC}>
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
