import { CheckCircleFilled, CopyOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { RQButton } from "lib/design-system/components";
import { useState } from "react";

const CopyButton = ({
  title,
  copyText,
  disableTooltip = false,
  showIcon = true,
  type = "text",
  size = "small",
  disabled = false,
  trackCopiedEvent = null,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  return (
    <Tooltip title={copyClicked ? "copied!" : "copy"} overlayStyle={{ display: disableTooltip && "none" }}>
      <RQButton
        type={type}
        size={"small" | size}
        icon={showIcon && (copyClicked ? <CheckCircleFilled style={{ color: "green" }} /> : <CopyOutlined />)}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(copyText);
          setCopyClicked(true);
          trackCopiedEvent?.();
          setTimeout(() => setCopyClicked(false), 500);
        }}
        disabled={disabled}
      >
        {title ? (copyClicked ? "Copied!" : title) : ""}
      </RQButton>
    </Tooltip>
  );
};

export default CopyButton;
