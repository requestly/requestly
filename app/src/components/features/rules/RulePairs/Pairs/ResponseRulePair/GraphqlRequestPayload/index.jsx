import React from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input } from "antd";
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
      <div>GraphQL Operation</div>
      <Input
        placeholder="Type"
        name="key"
        type="text"
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
        placeholder="Name"
        name="value"
        type="text"
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
    </>
  );
};

export default GraphqlRequestPayload;
