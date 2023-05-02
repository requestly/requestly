import React, { useCallback } from "react";
import { TooltipPlacement } from "antd/lib/tooltip";
import { EditOutlined } from "@ant-design/icons"; // any icon for type
import { Tooltip } from "antd";
import "./iconButton.scss";

interface Props extends React.HTMLAttributes<HTMLElement> {
  icon: typeof EditOutlined;
  onClick: () => void;
  tooltip?: string;
  tooltipPosition?: TooltipPlacement;
}

const IconButton: React.FC<Props> = ({
  icon: Icon,
  onClick,
  tooltip,
  tooltipPosition = "bottom",
  className,
  ...props
}) => {
  const handleButtonClick = useCallback((evt: React.MouseEvent) => {
    onClick();
    evt.stopPropagation();
  }, []);

  return (
    <Tooltip placement={tooltipPosition} title={tooltip}>
      <Icon onClick={handleButtonClick} {...props} className={`icon-button ${className}`} />
    </Tooltip>
  );
};

export default IconButton;
