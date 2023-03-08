import React from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row } from "antd";
import APP_CONSTANTS from "config/constants";
import getObjectValue from "../../../Filters/actions/getObjectValue";
import "./GraphqlRequestPayload.css";

const GraphqlRequestPayload = ({
  pairIndex,
  modifyPairAtGivenPath = () => {},
}) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const getInputValue = (payloadType) => {
    return getObjectValue(currentlySelectedRuleData, pairIndex, payloadType);
  };

  const handleModifyPair = (event, payloadType) => {
    modifyPairAtGivenPath(event, pairIndex, payloadType);
    //  add analytics
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
          value={getInputValue(
            APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_KEY
          )}
          onChange={(e) =>
            handleModifyPair(
              e,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_KEY
            )
          }
        />

        <Input
          name="value"
          type="text"
          placeholder="Name"
          className="graphql-operation-type-name"
          value={getInputValue(
            APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_VALUE
          )}
          onChange={(e) =>
            handleModifyPair(
              e,
              APP_CONSTANTS.PATH_FROM_PAIR.SOURCE_REQUEST_PAYLOAD_VALUE
            )
          }
        />
      </Row>
    </>
  );
};

export default GraphqlRequestPayload;
