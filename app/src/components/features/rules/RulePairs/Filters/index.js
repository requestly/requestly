import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect from "react-select";
import { Button, Modal, Row, Col, Input, Typography, Dropdown, Menu } from "antd";
//UTILITIES
import { getCurrentlySelectedRuleData } from "../../../../../store/selectors";
//EXTERNALS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
//actions
import deleteObjectAtPath from "./actions/deleteObjectAtPath";
import getObjectValue from "./actions/getObjectValue";
import { getReactSelectValue, setReactSelectValue } from "./actions/reactSelect";
import { CloseCircleOutlined, DownOutlined } from "@ant-design/icons";
import { isDesktopMode } from "utils/AppUtils";
import {
  trackPageUrlFilterModifiedEvent,
  trackResourceTypeFilterModifiedEvent,
  trackRequestMethodFilterModifiedEvent,
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import { setCurrentlySelectedRule } from "../../RuleBuilder/actions";
import { ResponseRuleResourceType } from "types/rules";
import { debounce, snakeCase } from "lodash";

const { Text, Link } = Typography;

const debouncedTrackPayloadKeyModifiedEvent = debounce(trackRequestPayloadKeyFilterModifiedEvent, 500);

const debouncedTrackPayloadValueModifiedEvent = debounce(trackRequestPayloadValueFilterModifiedEvent, 500);

const RESOURCE_TYPE_OPTIONS = [
  { label: "All (default)", value: "all", isDisabled: true },
  { label: "XHR", value: "xmlhttprequest" },
  { label: "JS", value: "script" },
  { label: "CSS", value: "stylesheet" },
  { label: "Image", value: "image" },
  { label: "Media", value: "media" },
  { label: "Font", value: "font" },
  { label: "Web Socket", value: "websocket" },
  { label: "Main Document", value: "main_frame" },
  { label: "iFrame Document", value: "sub_frame" },
];
const REQUEST_METHOD_OPTIONS = [
  { label: "All (default)", value: "all", isDisabled: true },
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "DELETE", value: "DELETE" },
  { label: "PATCH", value: "PATCH" },
  { label: "OPTIONS", value: "OPTIONS" },
  { label: "CONNECT", value: "CONNECT" },
  { label: "HEAD", value: "HEAD" },
];

const generatePlaceholderText = (operator) => {
  switch (operator) {
    case GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS:
      return "e.g. http://www.example.com";
    case GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS:
      return "e.g. facebook";
    case GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES:
      return "e.g. *://*.mydomain.com/*";
    case GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES:
      return "e.g. /example-([0-9]+)/ig";
    default:
      return "Select a condition first";
  }
};

const Filters = (props) => {
  const { modifyPairAtGivenPath } = props;
  const { pairIndex } = props;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const isResponseRule = () => {
    return currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE;
  };

  const hasLegacyPayloadFilter = () => {
    return ResponseRuleResourceType.UNKNOWN === currentlySelectedRuleData?.pairs?.[0]?.response?.resourceType;
  };

  const isRequestPayloadFilterCompatible = isResponseRule() && hasLegacyPayloadFilter();

  const isHTTPMethodFilterCompatible = true;
  const isPayloadUrlFilterCompatible = !isResponseRule() && !isDesktopMode();
  const isResourceTypeFilterCompatible = !isResponseRule() && !isDesktopMode(); // this partially works on desktop

  const getCurrentPageURLOperatorText = () => {
    switch (
      getObjectValue(currentlySelectedRuleData, pairIndex, APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR)
    ) {
      case GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES:
        return "Wildcard";
      case GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES:
        return "RegEx";
      case "":
        return "Select";
      default:
        return getObjectValue(
          currentlySelectedRuleData,
          pairIndex,
          APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR
        );
    }
  };

  const clearRequestPayload = (value) => {
    if (value === "") {
      deleteObjectAtPath(
        currentlySelectedRuleData,
        setCurrentlySelectedRule,
        APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD,
        pairIndex,
        dispatch
      );
    }
  };

  const renderClearFilterIcon = (filterToClear) => (
    <span
      // className="float-right custom-tooltip"
      onClick={() => {
        deleteObjectAtPath(
          currentlySelectedRuleData,
          setCurrentlySelectedRule,
          `source.filters.${filterToClear}`,
          pairIndex,
          dispatch
        );
      }}
      className="cursor-pointer"
    >
      <CloseCircleOutlined />
    </span>
  );

  //Analytics
  const LOG_ANALYTICS = {};
  LOG_ANALYTICS.PAGE_URL_MODIFIED = () => {
    trackPageUrlFilterModifiedEvent(currentlySelectedRuleData.ruleType);
  };
  LOG_ANALYTICS.RESOURCE_TYPE_MODIFIED = () => {
    trackResourceTypeFilterModifiedEvent(currentlySelectedRuleData.ruleType);
  };
  LOG_ANALYTICS.REQUEST_METHOD_MODIFIED = () => {
    trackRequestMethodFilterModifiedEvent(currentlySelectedRuleData.ruleType);
  };
  LOG_ANALYTICS.KEY = () => {
    debouncedTrackPayloadKeyModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.UNKNOWN)
    );
  };
  LOG_ANALYTICS.VALUE = () => {
    debouncedTrackPayloadValueModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.UNKNOWN)
    );
  };

  const urlOperatorOptions = (
    <Menu>
      <Menu.Item key={1}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR,
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
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR,
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
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR,
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
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR,
              GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES
            )
          }
        >
          Matches (Wildcard)
        </span>
      </Menu.Item>
    </Menu>
  );

  const renderRequestPayloadInput = () => {
    return isRequestPayloadFilterCompatible ? (
      <Row
        className="one-padding-bottom"
        style={{
          paddingBottom: "0.25rem",
          alignItems: "center",
        }}
      >
        <Col span={5}>
          <span>Request Payload</span>
        </Col>
        <Col span={8}>
          <Input
            placeholder="key"
            name="key"
            type="text"
            disabled={props.isInputDisabled}
            // className="has-dark-text height-two-rem"
            value={getObjectValue(
              currentlySelectedRuleData,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_KEY
            )}
            onChange={(event) => {
              modifyPairAtGivenPath(event, pairIndex, APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_KEY);
              clearRequestPayload(event.target.value);
              LOG_ANALYTICS.KEY();
            }}
          />
        </Col>
        <Col span={8} offset={1}>
          <Input
            placeholder="value"
            name="value"
            type="text"
            disabled={props.isInputDisabled}
            // className="has-dark-text height-two-rem"
            value={getObjectValue(
              currentlySelectedRuleData,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_VALUE
            )}
            onChange={(event) => {
              modifyPairAtGivenPath(event, pairIndex, APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_VALUE);
              clearRequestPayload(event.target.value);
              LOG_ANALYTICS.VALUE();
            }}
          />
        </Col>
        <Col offset={5}>
          <span style={{ fontSize: "0.75rem" }}>
            Through Request Payload you can also target GraphQL APIs.{" "}
            <Link
              onClick={() => window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOCS_MOCK_GRAPHQL, "_blank")}
              className="cursor-pointer"
            >
              Read more
            </Link>
          </span>
        </Col>
      </Row>
    ) : null;
  };

  const renderHTTPMethodInput = () => {
    return isHTTPMethodFilterCompatible ? (
      <Row
        className="one-padding-bottom"
        style={{
          paddingBottom: "1rem",
          alignItems: "center",
        }}
      >
        <Col span={5}>
          <span>Request Method</span>
        </Col>
        <Col span={17}>
          <ReactSelect
            isClearable={false}
            isMulti={true}
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary: "#141414",
                primary25: "#2b2b2b",
                neutral0: "#141414",
                neutral10: "#323337", // tag background color
                neutral80: "whitesmoke", // tag text color
                danger: "whitesmoke", // tag cancel icon color
                dangerLight: "#323337", // tag cancel background color
              },
            })}
            name="request-method"
            isDisabled={props.isInputDisabled}
            options={REQUEST_METHOD_OPTIONS}
            placeholder="All (default)"
            value={getReactSelectValue(
              currentlySelectedRuleData,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_METHOD,
              REQUEST_METHOD_OPTIONS
            )}
            onChange={(newValues) => {
              setReactSelectValue(
                currentlySelectedRuleData,
                setCurrentlySelectedRule,
                pairIndex,
                newValues,
                APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_METHOD,
                dispatch
              );
              LOG_ANALYTICS.REQUEST_METHOD_MODIFIED();
            }}
          />
        </Col>
        <Col span={2} align="right">
          {renderClearFilterIcon(GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD)}
        </Col>
      </Row>
    ) : null;
  };

  const renderPageUrlInput = () => {
    return isPayloadUrlFilterCompatible ? (
      <Row
        style={{
          paddingBottom: "1rem",
          alignItems: "center",
        }}
      >
        <Col span={3}>
          <span>Page URL</span>
        </Col>
        <Col span={6} align="center">
          <Dropdown overlay={urlOperatorOptions} disabled={props.isInputDisabled}>
            <Text
              strong
              className="ant-dropdown-link all-caps-text"
              onClick={(e) => {
                e.preventDefault();
                LOG_ANALYTICS.PAGE_URL_MODIFIED(e);
              }}
              style={{
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {getCurrentPageURLOperatorText()} <DownOutlined />
            </Text>
          </Dropdown>
        </Col>
        <Col span={12}>
          <Input
            placeholder={generatePlaceholderText(
              getObjectValue(
                currentlySelectedRuleData,
                pairIndex,
                APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_OPERATOR
              )
            )}
            name="description"
            type="text"
            value={getObjectValue(
              currentlySelectedRuleData,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_VALUE
            )}
            onChange={(event) => {
              modifyPairAtGivenPath(event, pairIndex, APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_URL_VALUE);
              LOG_ANALYTICS.PAGE_URL_MODIFIED();
            }}
            disabled={getCurrentPageURLOperatorText() === "Select" ? true : props.isInputDisabled}
          />
        </Col>
        <Col align="right" span={3}>
          {renderClearFilterIcon(GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL)}
        </Col>
      </Row>
    ) : null;
  };

  const renderResourceTypeInput = () => {
    return isResourceTypeFilterCompatible ? (
      <Row
        className="one-padding-bottom"
        style={{
          paddingBottom: "1rem",
          alignItems: "center",
        }}
      >
        <Col span={5}>
          <span>Resource Type</span>
        </Col>
        <Col span={17}>
          <ReactSelect
            isClearable={false}
            isMulti={true}
            name="resource-type"
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary: "#141414",
                primary25: "#2b2b2b",
                neutral0: "#141414",
                neutral10: "#323337", // tag background color
                neutral80: "whitesmoke", // tag text color
                danger: "whitesmoke", // tag cancel icon color
                dangerLight: "#323337", // tag cancel background color
              },
            })}
            options={RESOURCE_TYPE_OPTIONS}
            isDisabled={props.isInputDisabled}
            placeholder="All (default)"
            value={getReactSelectValue(
              currentlySelectedRuleData,
              pairIndex,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_RESOURCE_TYPE,
              RESOURCE_TYPE_OPTIONS
            )}
            onChange={(newValues) => {
              setReactSelectValue(
                currentlySelectedRuleData,
                setCurrentlySelectedRule,
                pairIndex,
                newValues,
                APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_RESOURCE_TYPE,
                dispatch
              );
              LOG_ANALYTICS.RESOURCE_TYPE_MODIFIED();
            }}
          />
        </Col>
        <Col span={2} align="right">
          {renderClearFilterIcon(GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE)}
        </Col>
      </Row>
    ) : null;
  };

  return (
    <React.Fragment>
      <Modal
        open={pairIndex !== false}
        onCancel={props.closeModal}
        footer={<Button onClick={props.closeModal}>Close</Button>}
        title="Source Filters"
        width={700}
      >
        <>
          {renderPageUrlInput()}
          {renderResourceTypeInput()}
          {renderHTTPMethodInput()}
          {renderRequestPayloadInput()}
        </>
      </Modal>
    </React.Fragment>
  );
};

export default Filters;
