import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row, Col, Tooltip, Select, Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { debounce, snakeCase } from "lodash";
import { ResponseRuleResourceType } from "types/rules";
import {
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadOperatorFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import "./GraphqlRequestPayload.css";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";

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
  gqlOperationFilter: RequestPayload;
  setGqlOperationFilter: React.Dispatch<React.SetStateAction<RequestPayload>>;
}

const GraphqlRequestPayload: React.FC<GraphqlRequestPayloadProps> = ({
  pairIndex,
  gqlOperationFilter,
  setGqlOperationFilter,
}) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  useEffect(() => {
    if (gqlOperationFilter.key && gqlOperationFilter.value) {
      dispatch(
        actions.updateRulePairAtGivenPath({
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
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_KEY]: newPayloadKey },
      })
    );

    setGqlOperationFilter((prev) => ({ ...prev, key: newPayloadKey }));
    debouncedTrackPayloadKeyModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
    );
  };

  const handleRequestPayloadOperatorChange = (operator: string) => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_OPERATOR]: operator },
      })
    );

    setGqlOperationFilter((prev) => ({ ...prev, operator }));
    trackRequestPayloadOperatorFilterModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
    );
  };

  const handleRequestPayloadValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPayloadValue = e?.target?.value ?? "";

    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_VALUE]: newPayloadValue },
      })
    );

    setGqlOperationFilter((prev) => ({ ...prev, value: newPayloadValue }));
    debouncedTrackPayloadValueModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
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
        <Row wrap={false} gutter={6}>
          <Col span={8}>
            <Input
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
            <Col span={4}>
              <Select
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
          <Col span={8}>
            <Input
              name="value"
              type="text"
              autoComplete="off"
              placeholder="value e.g. getUsers"
              className="graphql-operation-name-input"
              value={gqlOperationFilter.value}
              onChange={handleRequestPayloadValueChange}
            />
          </Col>
          <Button type="link" className="graphql-operation-filter-reset-button" onClick={clearRequestPayload}>
            Reset
          </Button>
        </Row>
      </Col>
    </Row>
  );
};

export default GraphqlRequestPayload;
