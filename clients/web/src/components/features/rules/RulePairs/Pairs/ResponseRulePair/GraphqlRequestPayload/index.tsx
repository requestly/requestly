import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row, Col, Tooltip, Select, Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { debounce, snakeCase } from "lodash";
import {
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadOperatorFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import "./GraphqlRequestPayload.css";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { ResponseRule } from "@requestly/shared/types/entities/rules";
import getObjectValue from "../../../Filters/actions/getObjectValue";

const {
  SOURCE_REQUEST_PAYLOAD,
  SOURCE_REQUEST_PAYLOAD_KEY,
  SOURCE_REQUEST_PAYLOAD_OPERATOR,
  SOURCE_REQUEST_PAYLOAD_VALUE,
} = APP_CONSTANTS.PATH_FROM_PAIR;

const debouncedTrackPayloadKeyModifiedEvent = debounce(trackRequestPayloadKeyFilterModifiedEvent, 500);

const debouncedTrackPayloadValueModifiedEvent = debounce(trackRequestPayloadValueFilterModifiedEvent, 500);

interface RequestPayload {
  key: string;
  operator?: string;
  value: string;
}

interface GraphqlRequestPayloadProps {
  pairIndex: number;
  isInputDisabled?: boolean;
}

const GraphqlRequestPayload: React.FC<GraphqlRequestPayloadProps> = ({ pairIndex, isInputDisabled = false }) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const currentPayloadKey = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_KEY),
    [pairIndex, currentlySelectedRuleData]
  );

  const currentPayloadOperator = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_OPERATOR),
    [pairIndex, currentlySelectedRuleData]
  );

  const currentPayloadValue = useMemo(
    () => getObjectValue(currentlySelectedRuleData, pairIndex, SOURCE_REQUEST_PAYLOAD_VALUE),
    [pairIndex, currentlySelectedRuleData]
  );

  const [gqlOperationFilter, setGqlOperationFilter] = useState<RequestPayload>({
    key: currentPayloadKey,
    operator: currentPayloadOperator,
    value: currentPayloadValue,
  });

  useEffect(() => {
    if (gqlOperationFilter.key && gqlOperationFilter.value) {
      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          triggerUnsavedChangesIndication: false,
          updates: {
            [SOURCE_REQUEST_PAYLOAD_KEY]: gqlOperationFilter.key,
            "source.filters.requestPayload.value": gqlOperationFilter.value,
          },
        })
      );
    }
  }, [dispatch, pairIndex, gqlOperationFilter.key, gqlOperationFilter.value]);

  const clearRequestPayload = () => {
    setGqlOperationFilter({ key: "", value: "" });
    deleteObjectAtPath(
      currentlySelectedRuleData,
      setCurrentlySelectedRule,
      SOURCE_REQUEST_PAYLOAD,
      pairIndex,
      dispatch
    );
  };

  const handleRequestPayloadKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPayloadKey = e?.target?.value ?? "";

    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_KEY]: newPayloadKey },
      })
    );

    setGqlOperationFilter((prev) => ({ ...prev, key: newPayloadKey }));
    debouncedTrackPayloadKeyModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRule.ResourceType.GRAPHQL_API)
    );
  };

  const handleRequestPayloadOperatorChange = (operator: string) => {
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_OPERATOR]: operator },
      })
    );

    setGqlOperationFilter((prev) => ({ ...prev, operator }));
    trackRequestPayloadOperatorFilterModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRule.ResourceType.GRAPHQL_API)
    );
  };

  const handleRequestPayloadValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPayloadValue = e?.target?.value ?? "";

    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_VALUE]: newPayloadValue },
      })
    );

    setGqlOperationFilter((prev) => ({ ...prev, value: newPayloadValue }));
    debouncedTrackPayloadValueModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRule.ResourceType.GRAPHQL_API)
    );
  };

  return (
    <Row className="w-full" wrap={false}>
      <Col span={24} data-tour-id="rule-editor-response-graphql-payload">
        <label className="subtitle graphql-operation-label">
          GraphQL Operation (Request Payload Filter)
          <Tooltip
            overlayInnerStyle={{ width: "302px" }}
            title={
              <span>
                Target rule based on GraphQL operation name in request.{" "}
                <a target="_blank" rel="noreferrer" href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_MOCK_GRAPHQL}>
                  Learn more
                </a>
              </span>
            }
          >
            <InfoCircleOutlined />
          </Tooltip>
        </label>
        <Row wrap={true} gutter={[4, 8]}>
          <Col span={24} lg={8}>
            <Input
              disabled={isInputDisabled}
              name="key"
              type="text"
              autoComplete="off"
              placeholder="Key e.g. operationName"
              className="graphql-operation-key-input"
              value={gqlOperationFilter.key}
              onChange={handleRequestPayloadKeyChange}
            />
          </Col>
          {isFeatureCompatible(FEATURES.GRAPHQL_PAYLOAD_FILTER_OPERATOR) && (
            <Col span={24} sm={14} md={8} lg={5}>
              <Select
                disabled={isInputDisabled}
                className="graphql-operation-filter-operator"
                options={[
                  { value: "Equals", label: "Equals" },
                  { value: "Contains", label: "Contains" },
                ]}
                value={gqlOperationFilter.operator || "Equals"}
                onChange={handleRequestPayloadOperatorChange}
              />
            </Col>
          )}
          <Col span={24} lg={9}>
            <Input
              disabled={isInputDisabled}
              name="value"
              type="text"
              autoComplete="off"
              placeholder="value e.g. getUsers"
              className="graphql-operation-name-input"
              value={gqlOperationFilter.value}
              onChange={handleRequestPayloadValueChange}
            />
          </Col>
          <Col span={1}>
            <Button
              type="link"
              disabled={isInputDisabled}
              className="graphql-operation-filter-reset-button"
              onClick={clearRequestPayload}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default GraphqlRequestPayload;
