import React from "react";
import { Button as AntDButton, ButtonProps as AntDButtonProps } from "antd";
import { useHotkeys } from "react-hotkeys-hook";
import { capitalize } from "lodash";
import "./Button.scss";

type RQButtonSize = "small" | "default" | "large";

type RQButtonType = "primary" | "secondary" | "transparent" | "danger" | "warning";

export interface ButtonProps extends Omit<AntDButtonProps, "size" | "type"> {
  hotKey?: string;
  showHotKeyText?: boolean;
  size?: RQButtonSize;
  type?: RQButtonType;
}

const RQ_TO_ANTD_PROPS: {
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
  const { hotKey, showHotKeyText, ...restProps } = props; // Remove unrecognised props

  const antDProps = { size: RQ_TO_ANTD_PROPS.size[props.size], type: RQ_TO_ANTD_PROPS.type[props.type] };

  return <AntDButton ref={ref} {...restProps} {...antDProps} className={`rq-custom-btn ${props.className ?? ""}`} />;
});

const ButtonWithHotkey = React.forwardRef<HTMLButtonElement, ButtonProps>(function ButtonWithHotkey(props, ref) {
  useHotkeys(
    props.hotKey,
    (event) => {
      // TODO: Fix type - hotkey callback gives keyboard event but button onClick needs mouse event
      props.onClick(event as any);
    },
    {
      preventDefault: true,
      enableOnFormTags: ["input", "INPUT"],
    }
  );

  const keys = props.hotKey.split("+");

  let children = props.children;
  if (props.showHotKeyText) {
    children = (
      <>
        {props.children}
        <span className="rq-custom-btn-hotkey-text">
          {keys.map((key, index) => (
            <>
              <span className="key">{capitalize(key)}</span>
              {index === keys.length - 1 ? null : <span>+</span>}
            </>
          ))}
        </span>
      </>
    );
  }

  return <BaseButton ref={ref} {...props} children={children} />;
});

interface RQButton extends React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> {}

export const Button: RQButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  if (props.hotKey) {
    return <ButtonWithHotkey ref={ref} {...props} />;
  }

  return <BaseButton ref={ref} {...props} />;
});
