import React, { useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getCurrentlySelectedRuleConfig } from "store/selectors";
import { Row, Col, Input, Badge, Menu, Typography } from "antd";
import { FaFilter } from "react-icons/fa";
import { ExperimentOutlined } from "@ant-design/icons";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { DownOutlined } from "@ant-design/icons";
import { RQDropdown, RQButton } from "lib/design-system/components";
import { MoreInfo } from "components/misc/MoreInfo";
import { TestURLModal } from "components/common/TestURLModal";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import PATHS from "config/constants/sub/paths";
import { trackMoreInfoClicked } from "modules/analytics/events/misc/moreInfo";
import {
  trackURLConditionModalClosed,
  trackURLConditionAnimationViewed,
} from "modules/analytics/events/features/testUrlModal";
import "./RequestSourceRow.css";

const { Text } = Typography;

const RequestSourceRow = ({ rowIndex, pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
  const { openFilterModal, getFilterCount, generatePlaceholderText } = helperFunctions;

  const dispatch = useDispatch();
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const [isTestURLModalVisible, setIsTestURLModalVisible] = useState(false);
  const [isTestURLClicked, setIsTestURLClicked] = useState(false);
  const isTestURLFeatureFlagOn = useFeatureIsOn("test_url_modal");
  const hasSeenTestURLAnimation = useRef(false);

  const sourceKeys = useMemo(
    () => [
      {
        id: 1,
        title: "URL",
        ruleKey: GLOBAL_CONSTANTS.RULE_KEYS.URL,
      },
      {
        id: 2,
        title: "Host",
        ruleKey: GLOBAL_CONSTANTS.RULE_KEYS.HOST,
      },
      {
        id: 3,
        title: "Path",
        ruleKey: GLOBAL_CONSTANTS.RULE_KEYS.PATH,
      },
    ],
    []
  );

  const sourceOperators = useMemo(
    () => [
      {
        id: 1,
        title: "Equals",
        ruleOperator: GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS,
      },
      {
        id: 2,
        title: "Contains",
        ruleOperator: GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS,
      },
      {
        id: 3,
        title: "Matches (RegEx)",
        ruleOperator: GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES,
      },
      {
        id: 4,
        title: "Matches (Wildcard)",
        ruleOperator: GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES,
      },
    ],
    []
  );

  const updatePair = useCallback((payload) => {});

  const renderSourceKeys = useMemo(() => {
    return (
      <Menu>
        {sourceKeys.map(({ id, title, ruleKey }) => (
          <Menu.Item
            key={id}
            onClick={(event) => {
              dispatch(
                actions.updateRulePairAtGivenPath({
                  event,
                  pairIndex,
                  objectPath: APP_CONSTANTS.PATH_FROM_PAIR.RULE_KEYS,
                  customValue: ruleKey,
                })
              );
            }}
          >
            {title}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [sourceKeys, pairIndex]);

  const renderSourceOperators = useMemo(() => {
    return (
      <Menu>
        {sourceOperators.map(({ id, title, ruleOperator }) => (
          <Menu.Item
            key={id}
            onClick={(event) => {
              dispatch(
                actions.updateRulePairAtGivenPath({
                  event,
                  pairIndex,
                  objectPath: APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS,
                  customValue: ruleOperator,
                })
              );
            }}
          >
            {title}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [sourceOperators, pairIndex]);

  const updateSourceFromTestURLModal = (newSource) => {
    const updatedSource = { ...pair.source, ...newSource };

    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        objectPath: APP_CONSTANTS.PATH_FROM_PAIR.SOURCE,
        customValue: updatedSource,
      })
    );
  };

  const shouldStartTestURLRippleEffect = useCallback(() => {
    if (
      pair.source.value &&
      !isTestURLClicked &&
      window.location.href.includes(PATHS.RULE_EDITOR.CREATE_RULE.RELATIVE) &&
      (pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES ||
        pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES)
    ) {
      if (!hasSeenTestURLAnimation.current) {
        trackURLConditionAnimationViewed();
        hasSeenTestURLAnimation.current = true;
      }
      return true;
    }
  }, [isTestURLClicked, pair.source.value, pair.source.operator]);

  return (
    <>
      {isTestURLModalVisible && (
        <TestURLModal
          isOpen={isTestURLModalVisible}
          onClose={(operator) => {
            setIsTestURLModalVisible(false);
            trackURLConditionModalClosed(operator, { rule_type: currentlySelectedRuleConfig.TYPE });
          }}
          source={pair.source}
          onSave={updateSourceFromTestURLModal}
          analyticsContext={{ rule_type: currentlySelectedRuleConfig.TYPE }}
        />
      )}

      <div className="rule-pair-source-row-wrapper">
        <Row
          gutter={6}
          key={rowIndex}
          align="middle"
          data-tour-id="rule-editor-source"
          className="rules-pair-content-header w-full"
          style={{ marginLeft: 0, marginRight: 0 }}
          wrap={false}
        >
          <Col className="shrink-0">
            <RQDropdown overlay={renderSourceKeys} disabled={isInputDisabled}>
              <Text
                strong
                className="rule-pair-source-dropdown cursor-pointer uppercase"
                onClick={(e) => e.preventDefault()}
              >
                {pair.source.key} {!isInputDisabled && <DownOutlined />}
              </Text>
            </RQDropdown>
          </Col>
          <Col className="shrink-0">
            <RQDropdown overlay={renderSourceOperators} disabled={isInputDisabled}>
              <Text
                strong
                className="rule-pair-source-dropdown cursor-pointer"
                onClick={(e) => e.preventDefault()}
                style={{ textTransform: "capitalize" }}
              >
                {pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES
                  ? "Wildcard"
                  : pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES
                  ? "RegEx"
                  : pair.source.operator}{" "}
                {!isInputDisabled && <DownOutlined />}
              </Text>
            </RQDropdown>
          </Col>
          <Col className="w-full">
            <Input
              placeholder={
                ruleDetails.ALLOW_APPLY_RULE_TO_ALL_URLS
                  ? "Enter url here or leave this field empty to apply rule to all url’s..."
                  : generatePlaceholderText(pair.source.operator, "source-value", pair.source.key)
              }
              type="text"
              onChange={(event) => {
                event?.preventDefault?.();
                dispatch(
                  actions.updateRulePairAtGivenPath({
                    event,
                    pairIndex,
                    objectPath: APP_CONSTANTS.PATH_FROM_PAIR.RULE_VALUE,
                  })
                );
              }}
              className="rules-pair-input"
              value={pair.source.value}
              disabled={isInputDisabled}
              data-selectionid="source-value"
            />
          </Col>
          {isTestURLFeatureFlagOn && (
            <RQButton
              className={`test-url-btn  ${shouldStartTestURLRippleEffect() && "ripple-animation"}`}
              iconOnly
              icon={<ExperimentOutlined />}
              type="default"
              disabled={!pair.source.value}
              onClick={() => {
                setIsTestURLClicked(true);
                setIsTestURLModalVisible(true);
              }}
            />
          )}
        </Row>
        {ruleDetails.ALLOW_REQUEST_SOURCE_FILTERS ? (
          <Col
            align="right"
            className="source-filter-col"
            style={{
              marginLeft: ruleDetails.TYPE === "Delay" ? 0 : "4px",
            }}
          >
            <MoreInfo
              text={
                <>
                  Advanced filters like resource type, request method to target requests when rule should be applied.{" "}
                  <a
                    className="tooltip-link"
                    href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_SOURCE_FILTERS}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackMoreInfoClicked("redirect_source_filter", currentlySelectedRuleConfig.TYPE)}
                  >
                    Learn More
                  </a>
                </>
              }
              analyticsContext="redirect_source_filter"
              source={currentlySelectedRuleConfig.TYPE}
            >
              <span
                onClick={() => openFilterModal(pairIndex)}
                className="cursor-pointer text-gray source-filter-icon-container"
              >
                <FaFilter />{" "}
                {getFilterCount(pairIndex) !== 0 ? (
                  <Badge style={{ color: "#465967", backgroundColor: "#E5EAEF" }}>{getFilterCount(pairIndex)}</Badge>
                ) : null}
              </span>
            </MoreInfo>
          </Col>
        ) : null}
      </div>
    </>
  );
};

export default RequestSourceRow;
