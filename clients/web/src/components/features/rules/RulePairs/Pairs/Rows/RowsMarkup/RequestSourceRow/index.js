import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getCurrentlySelectedRuleConfig, getCurrentlySelectedRuleData } from "store/selectors";
import { Row, Col, Input, Badge, Menu, Typography, Tooltip, Button, Dropdown, Space } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import APP_CONSTANTS from "config/constants";
import { DownOutlined } from "@ant-design/icons";
import { RQDropdown } from "lib/design-system/components";
import { TestURLModal } from "components/common/TestURLModal";
import { generatePlaceholderText } from "components/features/rules/RulePairs/utils";
import { getModeData, setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import Filters from "components/features/rules/RulePairs/Filters";
import { trackMoreInfoClicked } from "modules/analytics/events/misc/moreInfo";
import { trackURLConditionModalClosed } from "modules/analytics/events/features/testUrlModal";
import { trackRuleFilterModalToggled } from "modules/analytics/events/common/rules/filters";
import { trackSampleRegexClicked } from "modules/analytics/events/common/rules";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { RQButton } from "lib/design-system-v2/components";
import { sampleRegex } from "./sampleRegex";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./RequestSourceRow.css";

const { Text } = Typography;

const RequestSourceRow = ({ rowIndex, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const [isTestURLModalVisible, setIsTestURLModalVisible] = useState(false);
  const [ruleFilterActiveWithPairIndex, setRuleFilterActiveWithPairIndex] = useState(false);
  const [testURL, setTestURL] = useState("");
  const [sourceConfig, setSourceConfig] = useState(pair.source);
  const { MODE } = getModeData(window.location);

  const isSourceFilterFormatUpgraded = useCallback((pairIndex, rule) => {
    return Array.isArray(rule.pairs[pairIndex].source.filters);
  }, []);

  const migrateToNewSourceFilterFormat = useCallback(
    (pairIndex, copyOfCurrentlySelectedRule) => {
      copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters = [
        copyOfCurrentlySelectedRule.pairs[pairIndex].source.filters,
      ];
      setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule);
    },
    [dispatch]
  );

  const openFilterModal = useCallback(
    (pairIndex) => {
      const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
      if (!isSourceFilterFormatUpgraded(pairIndex, copyOfCurrentlySelectedRule)) {
        migrateToNewSourceFilterFormat(pairIndex, copyOfCurrentlySelectedRule);
      }
      setRuleFilterActiveWithPairIndex(pairIndex);
      trackRuleFilterModalToggled(true, currentlySelectedRuleData?.ruleType);
    },
    [currentlySelectedRuleData, isSourceFilterFormatUpgraded, migrateToNewSourceFilterFormat]
  );

  const closeFilterModal = useCallback(() => {
    setRuleFilterActiveWithPairIndex(false);
    trackRuleFilterModalToggled(false, currentlySelectedRuleData?.ruleType);
  }, [currentlySelectedRuleData?.ruleType]);

  const getFilterCount = useCallback(
    (pairIndex) => {
      const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
      return isSourceFilterFormatUpgraded(pairIndex, copyOfCurrentlySelectedRule)
        ? Object.keys(currentlySelectedRuleData.pairs[pairIndex].source.filters[0] || {}).filter(
            (key) => key !== GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL
          ).length
        : Object.keys(currentlySelectedRuleData.pairs[pairIndex].source.filters || {}).filter(
            (key) => key !== GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL
          ).length;
    },
    [currentlySelectedRuleData, isSourceFilterFormatUpgraded]
  );

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

  const renderSourceKeys = useMemo(() => {
    return (
      <Menu>
        {sourceKeys.map(({ id, title, ruleKey }) => {
          return (
            <Menu.Item
              key={id}
              onClick={(event) => {
                dispatch(
                  globalActions.updateRulePairAtGivenPath({
                    pairIndex,
                    updates: {
                      [APP_CONSTANTS.PATH_FROM_PAIR.RULE_KEYS]: ruleKey,
                    },
                  })
                );
              }}
            >
              {title}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }, [dispatch, sourceKeys, pairIndex]);

  const renderSourceOperators = useMemo(() => {
    return (
      <Menu>
        {sourceOperators.map(({ id, title, ruleOperator }) => (
          <Menu.Item
            key={id}
            onClick={(event) => {
              dispatch(
                globalActions.updateRulePairAtGivenPath({
                  pairIndex,
                  updates: {
                    [APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS]: ruleOperator,
                  },
                })
              );
            }}
          >
            {title}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [dispatch, sourceOperators, pairIndex]);

  const shouldShowFilterIcon = useMemo(() => {
    if (ruleDetails.TYPE === GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT) {
      return isFeatureCompatible(FEATURES.SCRIPT_RULE_SOURCE_FILTER);
    }

    return ruleDetails.ALLOW_REQUEST_SOURCE_FILTERS;
  }, [ruleDetails.ALLOW_REQUEST_SOURCE_FILTERS, ruleDetails.TYPE]);

  const updateSourceFromTestURLModal = (newSource) => {
    const updatedSource = { ...pair.source, ...newSource };

    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [APP_CONSTANTS.PATH_FROM_PAIR.SOURCE]: updatedSource,
        },
      })
    );
  };

  const sampleRegexDropdownItems = useMemo(() => {
    return sampleRegex.map(({ title, regex, url }, index) => {
      return {
        key: index,
        onClick: () => {
          setSourceConfig({
            ...pair.source,
            value: `/${regex}/`,
            operator: GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES,
          });
          setTestURL(url);
          setIsTestURLModalVisible(true);
          trackSampleRegexClicked();
        },
        label: (
          <>
            <div className="sample-regex-dropdown-item__title">{title}</div>
            <div className="sample-regex-dropdown-item__regex">{regex}</div>
          </>
        ),
      };
    });
  }, [pair.source]);

  const handleResetTestSourceConfig = () => {
    setSourceConfig(null);
    setTestURL("");
  };

  return (
    <>
      {isTestURLModalVisible && (
        <TestURLModal
          isOpen={isTestURLModalVisible}
          onClose={(operator) => {
            handleResetTestSourceConfig();
            setIsTestURLModalVisible(false);
            trackURLConditionModalClosed(operator, { rule_type: currentlySelectedRuleConfig.TYPE });
          }}
          source={sourceConfig || pair.source}
          defaultTestURL={testURL}
          originalSource={pair.source}
          onSave={updateSourceFromTestURLModal}
          analyticsContext={{ rule_type: currentlySelectedRuleConfig.TYPE }}
        />
      )}

      {ruleFilterActiveWithPairIndex !== false ? (
        <Filters
          pairIndex={ruleFilterActiveWithPairIndex}
          closeModal={closeFilterModal}
          isInputDisabled={isInputDisabled}
        />
      ) : null}

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
              autoFocus={MODE === "create"}
              placeholder={
                ruleDetails.ALLOW_APPLY_RULE_TO_ALL_URLS
                  ? "Enter url here or leave this field empty to apply rule to all url’s..."
                  : generatePlaceholderText(pair.source.operator, "source-value", pair.source.key)
              }
              type="text"
              onChange={(event) => {
                event?.preventDefault?.();
                dispatch(
                  globalActions.updateRulePairAtGivenPath({
                    pairIndex,
                    updates: {
                      [APP_CONSTANTS.PATH_FROM_PAIR.RULE_VALUE]: event?.target?.value,
                    },
                  })
                );
              }}
              className="rules-pair-input"
              value={pair.source.value}
              disabled={isInputDisabled}
              data-selectionid="source-value"
            />
          </Col>

          {(pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES ||
            pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES) && (
            <Tooltip
              overlayClassName="rq-tooltip"
              title={"Enter the source condition first"}
              placement="left"
              trigger={isInputDisabled ? ["hover"] : []}
            >
              <span>
                <Button
                  className="test-url-btn"
                  iconOnly
                  disabled={!pair.source.value || isInputDisabled}
                  onClick={() => {
                    setIsTestURLModalVisible(true);
                  }}
                >
                  <ExperimentOutlined /> Test{" "}
                  {pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES ? "regex" : "wildcard"}
                </Button>
              </span>
            </Tooltip>
          )}
        </Row>
        {shouldShowFilterIcon ? (
          <Col
            align="right"
            className="source-filter-col"
            style={{
              marginLeft: ruleDetails.TYPE === "Delay" ? 0 : "4px",
            }}
          >
            {!isInputDisabled && (
              <Tooltip
                placement="left"
                overlayClassName="rq-tooltip"
                title={
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
                <RQButton
                  type="transparent"
                  onClick={() => openFilterModal(pairIndex)}
                  className="cursor-pointer source-filter-icon-container"
                >
                  <span className={getFilterCount(pairIndex) !== 0 ? "badge-active" : "badge-default"}>
                    Filters
                    {getFilterCount(pairIndex) !== 0 ? <Badge>{getFilterCount(pairIndex)}</Badge> : null}
                  </span>
                </RQButton>
              </Tooltip>
            )}
          </Col>
        ) : null}
      </div>
      {pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES &&
        location.pathname.includes(PATHS.RULE_EDITOR.ABSOLUTE) && (
          <Col className="sample-regex-dropdown-container">
            <Dropdown
              menu={{ items: sampleRegexDropdownItems }}
              trigger={["click"]}
              overlayClassName="sample-regex-dropdown"
            >
              <Space>
                Try example regex
                <DownOutlined />
              </Space>
            </Dropdown>
          </Col>
        )}
    </>
  );
};

export default RequestSourceRow;
