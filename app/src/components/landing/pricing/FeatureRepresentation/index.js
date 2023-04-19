import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import checkIcon from "../../../../assets/img/icons/common/check.svg";

export default function FeatureRepresentation({ title, enabled }) {
  return (
    <div className="text-left text-gray plan-feature">
      {enabled ? <img src={checkIcon} alt="check" /> : <CloseOutlined />} {title}
    </div>
  );
}
