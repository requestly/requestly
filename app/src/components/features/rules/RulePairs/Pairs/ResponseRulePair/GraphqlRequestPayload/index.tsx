import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row, Col, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { debounce, snakeCase } from "lodash";
import { ResponseRuleResourceType } from "types/rules";
import {
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import "./GraphqlRequestPayload.css";

const {
  PATH_FROM_PAIR: { SOURCE_REQUEST_PAYLOAD, SOURCE_REQUEST_PAYLOAD_KEY, SOURCE_REQUEST_PAYLOAD_VALUE },
} = APP_CONSTANTS;

const debouncedTrackPayloadKeyModifiedEvent = debounce(trackRequestPayloadKeyFilterModifiedEvent, 500);

const debouncedTrackPayloadValueModifiedEvent = debounce(trackRequestPayloadValueFilterModifiedEvent, 500);

type RequestPayload = { key: string; value: string };

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
    deleteObjectAtPath(
      currentlySelectedRuleData,
      setCurrentlySelectedRule,
      SOURCE_REQUEST_PAYLOAD,
      pairIndex,
      dispatch
    );
  };

  const handleRequestPayloadKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_KEY]: e?.target?.value },
      })
    );
    const key = e.target.value;

    if (key === "" && gqlOperationFilter.value === "") {
      clearRequestPayload();
    }

    setGqlOperationFilter((prev) => ({ ...prev, key }));
    debouncedTrackPayloadKeyModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
    );
  };

  const handleRequestPayloadValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { [SOURCE_REQUEST_PAYLOAD_VALUE]: e?.target?.value },
      })
    );
    const value = e.target.value;

    if (value === "" && gqlOperationFilter.key === "") {
      clearRequestPayload();
    }

    setGqlOperationFilter((prev) => ({ ...prev, value }));
    debouncedTrackPayloadValueModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
    );
  };

  return (
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
      <Row wrap={false}>
        <Input
          name="key"
          type="text"
          autoComplete="off"
          placeholder="Key e.g. operationName"
          className="graphql-operation-key-input"
          value={gqlOperationFilter.key}
          onChange={handleRequestPayloadKeyChange}
        />
        <Input
          name="value"
          type="text"
          autoComplete="off"
          placeholder="value e.g. getUsers"
          className="graphql-operation-name-input"
          value={gqlOperationFilter.value}
          onChange={handleRequestPayloadValueChange}
        />
      </Row>
    </Col>
  );
};

export default GraphqlRequestPayload;
