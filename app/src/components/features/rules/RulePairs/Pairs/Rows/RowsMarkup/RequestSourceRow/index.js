import React from "react";
import { Row, Col, Input, Badge, Menu, Typography, Tooltip } from "antd";
import { FaFilter } from "react-icons/fa";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { DownOutlined } from "@ant-design/icons";
import { RQDropdown } from "lib/design-system/components";
import "./RequestSourceRow.css";

const { Text } = Typography;

const RequestSourceRow = ({
  rowIndex,
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => {
  const {
    modifyPairAtGivenPath,
    openFilterModal,
    getFilterCount,
    generatePlaceholderText,
  } = helperFunctions;

  const sourceKeyOptions = (
    <Menu>
      <Menu.Item key={1}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_KEYS,
              GLOBAL_CONSTANTS.RULE_KEYS.URL
            )
          }
        >
          URL
        </span>
      </Menu.Item>
      <Menu.Item key={2}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_KEYS,
              GLOBAL_CONSTANTS.RULE_KEYS.HOST
            )
          }
        >
          Host
        </span>
      </Menu.Item>
      <Menu.Item key={3}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_KEYS,
              GLOBAL_CONSTANTS.RULE_KEYS.PATH
            )
          }
        >
          Path
        </span>
      </Menu.Item>
    </Menu>
  );

  const sourceOperatorOptions = (
    <Menu>
      <Menu.Item key={1}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS,
              GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS
            )
          }
        >
          Equals
        </span>
      </Menu.Item>
      <Menu.Item key={2}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS,
              GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS
            )
          }
        >
          Contains
        </span>
      </Menu.Item>
      <Menu.Item key={3}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS,
              GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES
            )
          }
        >
          Matches (RegEx)
        </span>
      </Menu.Item>
      <Menu.Item key={4}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.RULE_OPERATORS,
              GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES
            )
          }
        >
          Matches (Wildcard)
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row
      gutter={6}
      key={rowIndex}
      align="middle"
      className="rules-pair-content-header"
      style={{ marginLeft: 0, marginRight: 0 }}
      wrap={false}
    >
      <Col className="shrink-0">
        <RQDropdown overlay={sourceKeyOptions} disabled={isInputDisabled}>
          <Text
            strong
            className="ant-dropdown-link cursor-pointer uppercase"
            onClick={(e) => e.preventDefault()}
          >
            {pair.source.key} {!isInputDisabled && <DownOutlined />}
          </Text>
        </RQDropdown>
      </Col>
      <Col className="shrink-0">
        <RQDropdown overlay={sourceOperatorOptions} disabled={isInputDisabled}>
          <Text
            strong
            className="ant-dropdown-link cursor-pointer"
            onClick={(e) => e.preventDefault()}
            style={{ textTransform: "capitalize" }}
          >
            {pair.source.operator ===
            GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES
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
              : generatePlaceholderText(pair.source.operator, "source-value")
          }
          type="text"
          onChange={(event) =>
            modifyPairAtGivenPath(event, pairIndex, "source.value")
          }
          className="rules-pair-input"
          value={pair.source.value}
          disabled={isInputDisabled}
        />
      </Col>

      {ruleDetails.ALLOW_REQUEST_SOURCE_FILTERS ? (
        <Col span={1} align="right" className="source-filter-col">
          &nbsp;&nbsp;
          <Tooltip title="Filters">
            <span
              onClick={() => openFilterModal(pairIndex)}
              className="cursor-pointer text-gray source-filter-icon-container"
            >
              <FaFilter />{" "}
              {getFilterCount(pairIndex) !== 0 ? (
                <Badge style={{ color: "#465967", backgroundColor: "#E5EAEF" }}>
                  {getFilterCount(pairIndex)}
                </Badge>
              ) : null}
            </span>
          </Tooltip>
        </Col>
      ) : null}
    </Row>
  );
};

export default RequestSourceRow;
