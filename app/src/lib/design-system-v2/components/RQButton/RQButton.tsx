import React from "react";
import { Button as AntDButton, ButtonProps as AntDButtonProps } from "antd";
import { useHotkeys } from "react-hotkeys-hook";
import { capitalize } from "lodash";
import { KEY_ICONS } from "../../../../constants";
import "./RQButton.scss";

type RQButtonSize = "small" | "default" | "large";

type RQButtonType = "primary" | "secondary" | "transparent" | "danger" | "warning";

export interface RQButtonProps extends Omit<AntDButtonProps, "size" | "type"> {
  hotKey?: string;
  hotKeyText?: string;
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

const BaseButton = React.forwardRef<HTMLButtonElement, RQButtonProps>(function BaseButton({ ...props }, ref) {
  const { hotKey, showHotKeyText, ...restProps } = props; // Remove unrecognised props

  const antDProps = { size: RQ_TO_ANTD_PROPS.size[props.size], type: RQ_TO_ANTD_PROPS.type[props.type] };

  const isIconOnly = props.icon && !props.children;

  return (
    <AntDButton
      ref={ref}
      {...restProps}
      {...antDProps}
      className={`rq-custom-btn ${isIconOnly ? "icon-only-btn" : ""} ${props.className ?? ""}`}
    />
  );
});

const ButtonWithHotkey = React.forwardRef<HTMLButtonElement, RQButtonProps>(function ButtonWithHotkey(props, ref) {
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

  const keys = props.hotKey.split("+").map((key) => KEY_ICONS[key] ?? key);

  let children = props.children;
  if (props.showHotKeyText) {
    children = (
      <>
        {props.children}
        <span className="rq-custom-btn-hotkey-text">
          {keys.map((key, index) => (
            <>
              <span className="key">{capitalize(key)}</span>
              {/* {index === keys.length - 1 ? null : <span>+</span>} */}
            </>
          ))}
        </span>
      </>
    );
  }

  return <BaseButton ref={ref} {...props} children={children} />;
});

interface RQCustomButton
  extends React.ForwardRefExoticComponent<RQButtonProps & React.RefAttributes<HTMLButtonElement>> {}

export const RQButton: RQCustomButton = React.forwardRef<HTMLButtonElement, RQButtonProps>(function Button(props, ref) {
  if (props.hotKey) {
    return <ButtonWithHotkey ref={ref} {...props} />;
  }

  return <BaseButton ref={ref} {...props} />;
});
