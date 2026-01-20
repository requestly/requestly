import React from "react";
import { RQNetworkEvent } from "../../../../types";
import "./payloadTabContent.scss";
import RequestBodyPanel from "./components/RequestBody/RequestBodyPanel";
import QueryParamsPanel from "./components/QueryParams/QueryParamsPanel";

interface Props {
  networkEvent: RQNetworkEvent;
}

const PayloadTabContent: React.FC<Props> = ({ networkEvent }) => {
  return (
    <div className="payload-tab-content">
      <QueryParamsPanel networkEvent={networkEvent} />
      <RequestBodyPanel networkEvent={networkEvent} />
    </div>
  );
};

export default PayloadTabContent;
