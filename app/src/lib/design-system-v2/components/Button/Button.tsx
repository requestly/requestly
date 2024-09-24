import React from "react";
import { Button as AntDButton, ButtonProps as AntDButtonProps } from "antd";
import { withHotKeys } from "../HotKeyWrapper";
import "./Button.scss";

type ButtonSize = "small" | "default" | "large";

type ButtonType = "primary" | "secondary" | "transparent" | "danger" | "warning";

interface BaseButtonProps extends Omit<AntDButtonProps, "size" | "type"> {
  size?: ButtonSize;
  type?: ButtonType;
}

const RQ_TO_ANTD_PROPS: {
  size: { [key in ButtonSize]: AntDButtonProps["size"] | any };
  type: { [key in ButtonType]: AntDButtonProps["type"] | any };
} = {
  size: {
    small: "small",
    default: "middle",
    large: "large",
  },

  type: {
    primary: "primary",
    secondary: "default",
    transparent: "ghost",
    danger: "danger",
    warning: "warning",
  },
};

const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(function BaseButton(props, ref) {
  const antDProps = { size: RQ_TO_ANTD_PROPS.size[props.size], type: RQ_TO_ANTD_PROPS.type[props.type] };

  const isIconOnly = props.icon && !props.children;

  return (
    <AntDButton
      ref={ref}
      {...props}
      {...antDProps}
      className={`rq-custom-btn ${isIconOnly ? "icon-only-btn" : ""} ${props.className ?? ""}`}
    />
  );
});

const ButtonWithHotkeys = withHotKeys<BaseButtonProps, HTMLButtonElement>(BaseButton);

type ButtonWithHotkeysType = typeof ButtonWithHotkeys;

interface ButtonProps extends ButtonWithHotkeysType {}

export const Button: ButtonProps = ButtonWithHotkeys;
