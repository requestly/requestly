import React from "react";
import { Button as AntDButton, ButtonProps } from "antd";
import "./Button.scss";

interface ButtonWrapperProps extends ButtonProps {
  hotKey?: string;
}

type Size = "default" | "small" | "large";

// const SIZE_NAME_TO_PIXEL: Record<Size, number> = {
//   small: 11,
//   default: 13,
//   large: 15,
// };

const BaseButtonWithForwardRef = React.forwardRef<HTMLButtonElement, ButtonWrapperProps>(
  function BaseButtonWithForwardRef(props, ref) {
    return <AntDButton ref={ref} className={`rq-btn custom-btn ${props.className ?? ""}`}></AntDButton>;
  }
);

const ButtonWithHotkeyForwardRef = React.forwardRef<HTMLButtonElement, ButtonWrapperProps>(
  // TODO: Check in devtool and refactor
  function ButtonWithHotkeyForwardRef(props, ref) {
    return <BaseButtonWithForwardRef ref={ref} />;
  }
);

const Button = React.forwardRef<HTMLButtonElement, ButtonWrapperProps>(function Button(props, ref) {
  if (props.hotKey) {
    return <ButtonWithHotkeyForwardRef ref={ref} {...props} />;
  }

  return <BaseButtonWithForwardRef ref={ref} {...props} />;
});

export { Button };
