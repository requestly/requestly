import React from "react";
import { Button as AntDButton, ButtonProps as AntDButtonProps } from "antd";
import "./Button.scss";

type RQButtonSize = "small" | "default" | "large";

type RQButtonType = "primary" | "secondary" | "transparent" | "danger" | "warning";

interface ButtonProps extends Omit<AntDButtonProps, "size" | "type"> {
  hotKey?: string;
  showHotKeyText?: boolean;
  size?: RQButtonSize;
  type?: RQButtonType;
}

const CUSTOM_TO_ANTD_PROPS: {
  size: { [key in RQButtonSize]: AntDButtonProps["size"] | any };
  type: { [key in RQButtonType]: AntDButtonProps["type"] | any };
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

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function BaseButton({ ...props }, ref) {
  const antDProps = { size: CUSTOM_TO_ANTD_PROPS.size[props.size], type: CUSTOM_TO_ANTD_PROPS.type[props.type] };

  let children = props.children;
  if (props.showHotKeyText && props.hotKey) {
    children = (
      <>
        {props.children} {"  "}
        {props.hotKey}
      </>
    );
  }

  // TODO: Remove unrecognised props on button element (see warning console ) eg hotKey
  return (
    <AntDButton
      ref={ref}
      {...props}
      {...antDProps}
      children={children}
      className={`rq-custom-btn ${props.className ?? ""}`}
    />
  );
});

const ButtonWithHotkey = React.forwardRef<HTMLButtonElement, ButtonProps>(function ButtonWithHotkey(props, ref) {
  return <BaseButton {...props} ref={ref} />;
});

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  if (props.hotKey) {
    return <ButtonWithHotkey ref={ref} {...props} />;
  }

  return <BaseButton ref={ref} {...props} />;
});

export { Button };
