import React from "react";
import { Tooltip } from "antd";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";

export default function FeatureRepresentation({ feature }) {
  return (
    <div className={`text-left text-gray plan-feature`}>
      <Tooltip title={feature.tooltip} placement="top">
        {feature.enabled ? <AiOutlineCheck /> : <AiOutlineClose />}
        <span className={`${feature.tooltip ? "plan-feature-tooltip-active" : ""}`}>{feature.title}</span>
      </Tooltip>
    </div>
  );
}
