import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect from "react-select";
import { Button, Modal, Row, Col, Input, Typography } from "antd";
//UTILITIES
import { getCurrentlySelectedRuleData } from "../../../../../store/selectors";
//EXTERNALS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import APP_CONSTANTS from "config/constants";
//actions
import deleteObjectAtPath from "./actions/deleteObjectAtPath";
import getObjectValue from "./actions/getObjectValue";
import { getReactSelectValue, setReactSelectValue } from "./actions/reactSelect";
import { isDesktopMode } from "utils/AppUtils";
import { FaUndo } from "@react-icons/all-files/fa/FaUndo";
import {
  trackPageUrlFilterModifiedEvent,
  trackResourceTypeFilterModifiedEvent,
  trackRequestMethodFilterModifiedEvent,
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
  trackPageDomainsFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import { setCurrentlySelectedRule } from "../../RuleBuilder/actions";
import { debounce, snakeCase } from "lodash";
import { globalActions } from "store/slices/global/slice";
import LINKS from "config/constants/sub/links";
import { ResponseRule } from "@requestly/shared/types/entities/rules";

const { Link } = Typography;

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

const Filters = (props) => {
  const { pairIndex } = props;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const isResponseRule = useMemo(() => {
    return currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE;
  }, [currentlySelectedRuleData.ruleType]);

  const isRequestRule = useMemo(() => {
    return currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REQUEST;
  }, [currentlySelectedRuleData.ruleType]);

  const isScriptRule = useMemo(() => {
    return currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT;
  }, [currentlySelectedRuleData.ruleType]);

  const hasLegacyPayloadFilter = () => {
    return ResponseRule.ResourceType.UNKNOWN === currentlySelectedRuleData?.pairs?.[0]?.response?.resourceType;
  };

  const isRequestPayloadFilterCompatible = isResponseRule && hasLegacyPayloadFilter();

  const isHTTPMethodFilterCompatible = !isScriptRule;
  const isPayloadUrlFilterCompatible = !isScriptRule && !isResponseRule && !isRequestRule && !isDesktopMode();
  const isResourceTypeFilterCompatible = !isResponseRule && !isRequestRule && !isDesktopMode(); // this partially works on desktop

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
          filterToClear === GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_DOMAINS
            ? [
                `source.filters.${filterToClear}`,
                `source.filters.${GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL}`,
              ]
            : `source.filters.${filterToClear}`,
          pairIndex,
          dispatch
        );
      }}
      className="cursor-pointer"
    >
      <FaUndo className="text-sm" />
    </span>
  );

  //Analytics
  const LOG_ANALYTICS = {};
  LOG_ANALYTICS.PAGE_URL_MODIFIED = () => {
    trackPageUrlFilterModifiedEvent(currentlySelectedRuleData.ruleType);
  };

  LOG_ANALYTICS.PAGE_DOMAINS_MODIFIED = () => {
    trackPageDomainsFilterModifiedEvent(currentlySelectedRuleData.ruleType);
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
      snakeCase(ResponseRule.ResourceType.UNKNOWN)
    );
  };
  LOG_ANALYTICS.VALUE = () => {
    debouncedTrackPayloadValueModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRule.ResourceType.UNKNOWN)
    );
  };

  const updateSourceRequestPayload = useCallback(
    (event, path) => {
      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            [path]: event?.target?.value,
          },
        })
      );
    },
    [dispatch, pairIndex]
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
            onChange={(e) => {
              e?.preventDefault?.();
              updateSourceRequestPayload(e, APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_KEY);
              clearRequestPayload(e.target.value);
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
            onChange={(e) => {
              e?.preventDefault?.();
              updateSourceRequestPayload(e, APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_VALUE);
              clearRequestPayload(e.target.value);
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
                neutral0: "#1f1f1f",
                neutral10: "#323337", // tag background color
                neutral80: "whitesmoke", // tag text color
                danger: "whitesmoke", // tag cancel icon color
                dangerLight: "#323337",
                // tag cancel background color
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
        <>
          <Col span={5}>
            <span>Page Domain</span>
          </Col>
          <Col span={17}>
            <Input
              placeholder={"mydomain.com"}
              name="description"
              type="text"
              value={getObjectValue(
                currentlySelectedRuleData,
                pairIndex,
                APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_DOMAINS
              )}
              onChange={(e) => {
                e?.preventDefault?.();
                if (e.target.value === "") {
                  deleteObjectAtPath(
                    currentlySelectedRuleData,
                    setCurrentlySelectedRule,
                    [
                      `source.filters.${GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_DOMAINS}`,
                      `source.filters.${GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL}`,
                    ],
                    pairIndex,
                    dispatch
                  );
                } else {
                  dispatch(
                    globalActions.updateRulePairAtGivenPath({
                      pairIndex,
                      updates: {
                        [APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_PAGE_DOMAINS]: [e.target.value],
                      },
                    })
                  );
                }
                LOG_ANALYTICS.PAGE_DOMAINS_MODIFIED();
              }}
              disabled={props.isInputDisabled}
            />
          </Col>
        </>

        <Col align="right" span={2}>
          {renderClearFilterIcon(GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_DOMAINS)}
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
                neutral0: "#1f1f1f",
                neutral10: "#323337", // tag background color
                neutral80: "whitesmoke", // tag text color
                danger: "whitesmoke", // tag cancel icon color
                dangerLight: "#323337", // tag cancel background color
              },
            })}
            options={
              !isScriptRule
                ? RESOURCE_TYPE_OPTIONS
                : RESOURCE_TYPE_OPTIONS.filter((option) => ["main_frame", "sub_frame"].includes(option.value))
            }
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
        title="Apply advance source filters"
        width={700}
      >
        <div className="source-filter-modal-description">
          Advanced source filters lets you set precise conditions, applying rules to specific web pages, domains,
          request types, methods, or payloads.{" "}
          <a href={LINKS.REQUESTLY_DOCS_SOURCE_FILTERS} rel="noreferrer" target="_blank">
            Learn more
          </a>
        </div>
        {renderPageUrlInput()}
        {renderResourceTypeInput()}
        {renderHTTPMethodInput()}
        {renderRequestPayloadInput()}
      </Modal>
    </React.Fragment>
  );
};

export default Filters;
