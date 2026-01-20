import React, { useCallback } from "react";
import { PushpinFilled, PushpinOutlined } from "@ant-design/icons";
import { RuleOrGroup } from "../../../../types";
import "./pinAction.css";

interface PinActionProps {
  record: RuleOrGroup;
  updateRecord: (record: RuleOrGroup) => void;
}

const PinAction: React.FC<PinActionProps> = ({ record, updateRecord }) => {
  const handlePinClicked = useCallback(() => {
    updateRecord({ ...record, isFavourite: !record.isFavourite });
  }, [record, updateRecord]);

  return record.isFavourite ? (
    <PushpinFilled title="Pin rule" rotate={-45} className="pin-icon active" onClick={handlePinClicked} />
  ) : (
    <PushpinOutlined title="Pin rule" rotate={-45} className="pin-icon" onClick={handlePinClicked} />
  );
};

export default PinAction;
