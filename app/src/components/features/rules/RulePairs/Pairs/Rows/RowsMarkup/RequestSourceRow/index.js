import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleConfig } from "store/selectors";
import { Row, Col, Input, Badge, Menu, Typography } from "antd";
import { FaFilter } from "react-icons/fa";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { DownOutlined } from "@ant-design/icons";
import { RQDropdown } from "lib/design-system/components";
import { MoreInfo } from "components/misc/MoreInfo";
import { trackMoreInfoClicked } from "modules/analytics/events/misc/moreInfo";
import "./RequestSourceRow.css";

const { Text } = Typography;

const RequestSourceRow = ({ rowIndex, pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
  const { modifyPairAtGivenPath, openFilterModal, getFilterCount, generatePlaceholderText } = helperFunctions;

  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);

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

  const renderSourceKeys = useMemo(() => {
    return (
      <Menu>
        {sourceKeys.map(({ id, title, ruleKey }) => (
          <Menu.Item
            key={id}
            onClick={(event) => {
              modifyPairAtGivenPath(event, pairIndex, APP_CONSTANTS.PATH_FROM_PAIR.RULE_KEYS, ruleKey);
            }}
          >
            {title}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [sourceKeys, modifyPairAtGivenPath, pairIndex]);

  const renderSourceOperators = useMemo(() => {
    return (
      <Menu>
        {sourceOperators.map(({ id, title, ruleOperator }) => (
          <Menu.Item
            key={id}
            onClick={(event) => {
              modifyPairAtGivenPath(event, pairIndex, APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS, ruleOperator);
            }}
          >
            {title}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [sourceOperators, modifyPairAtGivenPath, pairIndex]);

  return (
    <Row
      gutter={6}
      key={rowIndex}
      align="middle"
      data-tour-id="rule-editor-source"
      className="rules-pair-content-header"
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
      <Col
        span={14}
        md={ruleDetails.TYPE === "Delay" ? 12 : 17}
        lg={ruleDetails.TYPE === "Delay" ? 15 : 17}
        xl={ruleDetails.TYPE === "Delay" ? 15 : 17}
      >
        <Input
          placeholder={
            ruleDetails.ALLOW_APPLY_RULE_TO_ALL_URLS
              ? "Enter url here or leave this field empty to apply rule to all url’s..."
              : generatePlaceholderText(pair.source.operator, "source-value", pair.source.key)
          }
          type="text"
          onChange={(event) => modifyPairAtGivenPath(event, pairIndex, "source.value")}
          className="rules-pair-input"
          value={pair.source.value}
          disabled={isInputDisabled}
          data-selectionid="source-value"
        />
      </Col>

      {ruleDetails.ALLOW_REQUEST_SOURCE_FILTERS ? (
        <Col span={1} align="right" className="source-filter-col">
          &nbsp;&nbsp;
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
    </Row>
  );
};

export default RequestSourceRow;
