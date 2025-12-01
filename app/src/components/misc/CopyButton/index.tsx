import React, { useState } from "react";
import { CheckCircleFilled, CopyOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { RQButton, RQButtonProps } from "lib/design-system-v2/components";
import { copyToClipBoard } from "utils/Misc";

const CopyButton: React.FC<{
  title?: string;
  copyText: string;
  disableTooltip?: boolean;
  showIcon?: boolean;
  type?: RQButtonProps["type"];
  size?: RQButtonProps["size"];
  disabled?: boolean;
  trackCopiedEvent?: () => void;
  tooltipText?: string;
  icon?: React.ReactNode;
}> = ({
  title = "",
  copyText,
  disableTooltip = false,
  showIcon = true,
  type = "text" as RQButtonProps["type"],
  size = "small" as RQButtonProps["size"],
  disabled = false,
  trackCopiedEvent = null,
  tooltipText = "Copy",
  icon = null,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);

  const handleCopyClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const result = await copyToClipBoard(copyText);
    if (result.success) {
      setCopyClicked(true);
      trackCopiedEvent?.();
      setTimeout(() => setCopyClicked(false), 500);
    }
  };
  return (
    <Tooltip
      title={copyClicked ? "Copied!" : tooltipText}
      overlayStyle={{ display: disableTooltip ? "none" : undefined }}
      color="#000"
    >
      <RQButton
        type={type}
        size={size || "small"}
        icon={showIcon && (copyClicked ? <CheckCircleFilled style={{ color: "green" }} /> : icon ?? <CopyOutlined />)}
        onClick={handleCopyClick}
        disabled={disabled}
      >
        {title ? (copyClicked ? "Copied!" : title) : ""}
      </RQButton>
    </Tooltip>
  );
};

export default CopyButton;
