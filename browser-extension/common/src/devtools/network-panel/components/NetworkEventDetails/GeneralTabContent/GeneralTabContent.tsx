import React from "react";
import { NetworkEvent } from "../../../types";
import PropertyRow from "../../PropertyRow/PropertyRow";
import "./generalTabContent.scss";

interface Props {
  networkEvent: NetworkEvent;
}

const GeneralTabContent: React.FC<Props> = ({ networkEvent }) => {
  return (
    <div className="general-tab-content">
      <PropertyRow name="Request URL" value={networkEvent.request.url} />
    </div>
  );
};

export default GeneralTabContent;
