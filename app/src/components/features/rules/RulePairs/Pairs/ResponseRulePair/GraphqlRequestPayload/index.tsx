import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
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

const requestPayload = {
  key: "graphql_request_payload_key",
  value: "graphql_request_payload_value",
};

interface GraphqlRequestPayloadProps {
  pairIndex: number;
  modifyPairAtGivenPath: (
    e: React.ChangeEvent<HTMLInputElement>,
    pairIndex: number,
    payloadPath: string,
    customValue?: string | unknown,
    otherValuesToModify?: { path: string; value: string | unknown }[],
    triggerUnsavedChangesIndication?: boolean
  ) => void;
}

const GraphqlRequestPayload: React.FC<GraphqlRequestPayloadProps> = ({
  pairIndex,
  modifyPairAtGivenPath = () => {},
}) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const ruleId = currentlySelectedRuleData.id;
  const requestPayloadKey = `${requestPayload.key}_${ruleId}`;
  const requestPayloadValue = `${requestPayload.value}_${ruleId}`;
  const isRequestPayloadFilterCompatible = isFeatureCompatible(
    FEATURES.REQUEST_PAYLOAD_FILTER
  );

  const [payloadkey, setPayloadkey] = useState<string>(
    localStorage.getItem(requestPayloadKey) ?? ""
  );
  const [payloadValue, setPayloadValue] = useState<string>(
    localStorage.getItem(requestPayloadValue) ?? ""
  );

  useEffect(() => {
    const payloadKey = localStorage.getItem(requestPayloadKey) ?? "";
    const payloadValue = localStorage.getItem(requestPayloadValue) ?? "";

    setPayloadkey(payloadKey);
    setPayloadValue(payloadValue);

    if (payloadKey && payloadValue)
      modifyPairAtGivenPath(
        null,
        pairIndex,
        SOURCE_REQUEST_PAYLOAD_KEY,
        payloadKey,
        [
          {
            path: "source.filters[0].requestPayload.value",
            value: payloadValue,
          },
        ],
        false
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayloadKey, requestPayloadValue]);

  useEffect(() => {
    localStorage.setItem(requestPayloadKey, payloadkey);
    localStorage.setItem(requestPayloadValue, payloadValue);
  }, [payloadkey, payloadValue, requestPayloadKey, requestPayloadValue]);

  const clearRequestPayload = () => {
    deleteObjectAtPath(
      currentlySelectedRuleData,
      setCurrentlySelectedRule,
      SOURCE_REQUEST_PAYLOAD,
      pairIndex,
      dispatch
    );
  };

  const handleModifyPair = (
    e: React.ChangeEvent<HTMLInputElement>,
    payloadPath: string
  ) => {
    modifyPairAtGivenPath(e, pairIndex, payloadPath);
    const value = e.target.value;

    if (value === "") {
      clearRequestPayload();
      setPayloadkey("");
      setPayloadValue("");
    }

    if (payloadPath === SOURCE_REQUEST_PAYLOAD_KEY) {
      setPayloadkey(value);
      trackRequestPayloadKeyFilterModifiedEvent(
        currentlySelectedRuleData.ruleType
      );
    } else {
      setPayloadValue(value);
      trackRequestPayloadValueFilterModifiedEvent(
        currentlySelectedRuleData.ruleType
      );
    }
  };

  return isRequestPayloadFilterCompatible ? (
    <>
      <label className="subtitle graphql-operation-label">
        GraphQL Operation
        <a
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer"
          href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_MOCK_GRAPHQL}
        >
          <InfoCircleOutlined />
        </a>
      </label>
      <Row wrap={false}>
        <Input
          name="key"
          type="text"
          autoComplete="off"
          placeholder="key"
          className="graphql-operation-type-input"
          value={payloadkey}
          onChange={(e) => handleModifyPair(e, SOURCE_REQUEST_PAYLOAD_KEY)}
        />
        <Input
          name="value"
          type="text"
          autoComplete="off"
          placeholder="value"
          className="graphql-operation-type-name"
          value={payloadValue}
          onChange={(e) => handleModifyPair(e, SOURCE_REQUEST_PAYLOAD_VALUE)}
        />
      </Row>
    </>
  ) : null;
};

export default GraphqlRequestPayload;
