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
  PATH_FROM_PAIR: {
    SOURCE_REQUEST_PAYLOAD,
    SOURCE_REQUEST_PAYLOAD_KEY,
    SOURCE_REQUEST_PAYLOAD_VALUE,
  },
} = APP_CONSTANTS;

const GraphqlRequestPayload = ({
  pairIndex,
  modifyPairAtGivenPath = () => {},
}) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const getInputValue = (payloadType) => {
    return getObjectValue(currentlySelectedRuleData, pairIndex, payloadType);
  };

  const clearRequestPayload = (value) => {
    if (value === "") {
      deleteObjectAtPath(
        currentlySelectedRuleData,
        setCurrentlySelectedRule,
        SOURCE_REQUEST_PAYLOAD,
        pairIndex,
        dispatch
      );
    }
  };

  const handleModifyPair = (e, path) => {
    let payloadType = path?.split(".");
    payloadType = payloadType[payloadType.length - 1];

    modifyPairAtGivenPath(e, pairIndex, path);
    clearRequestPayload(e.target.value);

    if (payloadType === "key") {
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
          placeholder="Type"
          className="graphql-operation-type-input"
          value={getInputValue(SOURCE_REQUEST_PAYLOAD_KEY)}
          onChange={(e) => handleModifyPair(e, SOURCE_REQUEST_PAYLOAD_KEY)}
        />
        <Input
          name="value"
          type="text"
          placeholder="Name"
          className="graphql-operation-type-name"
          value={getInputValue(SOURCE_REQUEST_PAYLOAD_VALUE)}
          onChange={(e) => handleModifyPair(e, SOURCE_REQUEST_PAYLOAD_VALUE)}
        />
      </Row>
    </>
  );
};

export default GraphqlRequestPayload;
