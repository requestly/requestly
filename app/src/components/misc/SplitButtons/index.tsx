import React from "react";
import { Button, Tooltip, Dropdown } from "antd";
import { ButtonType } from "antd/lib/button";
import "./splitButtons.scss";
import DownArrow from "assets/icons/down-arrow.svg?react";
import classNames from "classnames";

interface CommonButtonProps {
  type?: ButtonType;
  disabled?: boolean;
}

interface SplitButtonProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  tooltip?: string;
  onTooltipVisibilityChange?: (visible: boolean) => void;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isDropdown?: boolean;
  menu?: React.ReactElement;
}

interface SplitButtonsProps {
  left: SplitButtonProps;
  right: SplitButtonProps;
  style?: React.CSSProperties;
}

const SplitButton: React.FC<SplitButtonProps & CommonButtonProps & { className: string }> = (props) => {
  const buttonProps = {
    className: props.className,
    type: props.type,
    icon: props.icon,
    disabled: props.disabled,
    onClick: props.onClick,
  };

  return (
    <Tooltip title={props.tooltip} placement="bottom" onOpenChange={props.onTooltipVisibilityChange}>
      {props.isDropdown ? (
        <Dropdown overlay={props.menu}>
          <Button {...buttonProps}>
            {props.label} <DownArrow className="down-arrow-icon" />
          </Button>
        </Dropdown>
      ) : (
        <Button {...buttonProps}>{props.label}</Button>
      )}
    </Tooltip>
  );
};

const SplitButtons: React.FC<SplitButtonsProps & CommonButtonProps> = ({ type, left, right, disabled, style }) => {
  return (
    <div className="rq-split-buttons" style={style}>
      {left && (
        <SplitButton
          className={classNames("split-button", { "left-button": !!right })}
          type={type}
          disabled={disabled}
          {...left}
        />
      )}
      {right && (
        <SplitButton
          className={classNames("split-button", { "right-button": !!left })}
          type={type}
          disabled={disabled}
          {...right}
        />
      )}
    </div>
  );
};

export default SplitButtons;
