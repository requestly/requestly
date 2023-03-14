import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row } from "antd";
import APP_CONSTANTS from "config/constants";
import getObjectValue from "../../../Filters/actions/getObjectValue";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import {
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import "./GraphqlRequestPayload.css";

const {
  PATH_FROM_PAIR: { SOURCE_REQUEST_PAYLOAD_KEY, SOURCE_REQUEST_PAYLOAD_VALUE },
} = APP_CONSTANTS;

interface GraphqlRequestPayloadProps {
  pairIndex: number;
  modifyPairAtGivenPath: (
    e: React.ChangeEvent<HTMLInputElement>,
    pairIndex: number,
    payloadPath: string
  ) => void;
}

const GraphqlRequestPayload: React.FC<GraphqlRequestPayloadProps> = ({
  pairIndex,
  modifyPairAtGivenPath = () => {},
}) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const getInputValue = (payloadPath: string) => {
    return getObjectValue(currentlySelectedRuleData, pairIndex, payloadPath);
  };

  const clearRequestPayload = (payloadPath: string) => {
    deleteObjectAtPath(
      currentlySelectedRuleData,
      setCurrentlySelectedRule,
      payloadPath,
      pairIndex,
      dispatch
    );
  };

  const handleModifyPair = (
    e: React.ChangeEvent<HTMLInputElement>,
    payloadPath: string
  ) => {
    modifyPairAtGivenPath(e, pairIndex, payloadPath);

    if (e?.target?.value === "") {
      clearRequestPayload(payloadPath);
    }

    if (payloadPath === SOURCE_REQUEST_PAYLOAD_KEY) {
      trackRequestPayloadKeyFilterModifiedEvent(
        currentlySelectedRuleData.ruleType
      );
    } else {
      trackRequestPayloadValueFilterModifiedEvent(
        currentlySelectedRuleData.ruleType
      );
    }
  };

  return (
    <>
      <label className="subtitle graphql-operation-label">
        GraphQL Operation
      </label>
      <Row wrap={false}>
        <Input
          name="key"
          type="text"
          placeholder="key"
          className="graphql-operation-type-input"
          value={getInputValue(SOURCE_REQUEST_PAYLOAD_KEY)}
          onChange={(e) => handleModifyPair(e, SOURCE_REQUEST_PAYLOAD_KEY)}
        />
        <Input
          name="value"
          type="text"
          placeholder="value"
          className="graphql-operation-type-name"
          value={getInputValue(SOURCE_REQUEST_PAYLOAD_VALUE)}
          onChange={(e) => handleModifyPair(e, SOURCE_REQUEST_PAYLOAD_VALUE)}
        />
      </Row>
    </>
  );
};

export default GraphqlRequestPayload;
