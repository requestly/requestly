import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import getObjectValue from "../../../Filters/actions/getObjectValue";
import { debounce } from "lodash";
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

const debouncedTrackPayloadKeyModifiedEvent = debounce(
  trackRequestPayloadKeyFilterModifiedEvent,
  500
);

const debouncedTrackPayloadValueModifiedEvent = debounce(
  trackRequestPayloadValueFilterModifiedEvent,
  500
);

type RequestPayload = { key: string; value: string };

interface GraphqlRequestPayloadProps {
  pairIndex: number;
  payloadBackup: RequestPayload;
  setPayloadBackup: (payload: RequestPayload) => void;
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
  payloadBackup,
  setPayloadBackup,
  modifyPairAtGivenPath = () => {},
}) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isRequestPayloadFilterCompatible = isFeatureCompatible(
    FEATURES.REQUEST_PAYLOAD_FILTER
  );
  const currentPayloadKey = useMemo(
    () =>
      getObjectValue(
        currentlySelectedRuleData,
        pairIndex,
        SOURCE_REQUEST_PAYLOAD_KEY
      ),
    [pairIndex, currentlySelectedRuleData]
  );

  const currentPayloadValue = useMemo(
    () =>
      getObjectValue(
        currentlySelectedRuleData,
        pairIndex,
        SOURCE_REQUEST_PAYLOAD_VALUE
      ),
    [pairIndex, currentlySelectedRuleData]
  );

  const [payloadKey, setPayloadKey] = useState<string>(
    payloadBackup?.key ?? ""
  );
  const [payloadValue, setPayloadValue] = useState<string>(
    payloadBackup?.value ?? ""
  );

  useEffect(() => {
    if (payloadKey && payloadValue) {
      setPayloadBackup({ key: payloadKey, value: payloadValue });
    }
  }, [payloadKey, payloadValue, setPayloadBackup]);

  useEffect(() => {
    if (!payloadBackup) return;

    if (payloadBackup.key && payloadBackup.value)
      modifyPairAtGivenPath(
        null,
        pairIndex,
        SOURCE_REQUEST_PAYLOAD_KEY,
        payloadBackup.key,
        [
          {
            path: "source.filters[0].requestPayload.value",
            value: payloadBackup.value,
          },
        ],
        false
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadBackup]);

  useEffect(() => {
    if (currentPayloadKey && currentPayloadValue) {
      setPayloadKey(currentPayloadKey);
      setPayloadValue(currentPayloadValue);
    }
  }, [currentPayloadKey, currentPayloadValue]);

  const clearRequestPayload = () => {
    deleteObjectAtPath(
      currentlySelectedRuleData,
      setCurrentlySelectedRule,
      SOURCE_REQUEST_PAYLOAD,
      pairIndex,
      dispatch
    );
  };

  const handleRequestPayloadKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    modifyPairAtGivenPath(e, pairIndex, SOURCE_REQUEST_PAYLOAD_KEY);
    const value = e.target.value;

    if (value === "") {
      clearRequestPayload();
    }

    setPayloadKey(value);
    debouncedTrackPayloadKeyModifiedEvent(currentlySelectedRuleData.ruleType);
  };

  const handleRequestPayloadValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    modifyPairAtGivenPath(e, pairIndex, SOURCE_REQUEST_PAYLOAD_VALUE);
    const value = e.target.value;

    if (value === "") {
      clearRequestPayload();
    }

    setPayloadValue(value);
    debouncedTrackPayloadValueModifiedEvent(currentlySelectedRuleData.ruleType);
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
          value={payloadKey}
          onChange={handleRequestPayloadKeyChange}
        />
        <Input
          name="value"
          type="text"
          autoComplete="off"
          placeholder="value"
          className="graphql-operation-type-name"
          value={payloadValue}
          onChange={handleRequestPayloadValueChange}
        />
      </Row>
    </>
  ) : null;
};

export default GraphqlRequestPayload;
