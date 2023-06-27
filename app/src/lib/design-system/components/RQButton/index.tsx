import React, { useMemo } from "react";
import { Button, ButtonProps } from "antd";
import "./RQButton.css";

interface RQButtonProps extends ButtonProps {
  iconOnly?: boolean;
}

export const RQButton: React.FC<RQButtonProps> = (props) => {
  const filteredProps = useMemo(
    () =>
      Object.keys(props).reduce(
        (result, key: keyof RQButtonProps) => (key !== "iconOnly" ? { ...result, [key]: props[key] } : result),
        {}
      ),
    [props]
  );

  return (
    <Button
      type="default"
      {...filteredProps}
      className={`rq-btn ${props.type === "default" ? "btn-default" : ""} ${props.iconOnly ? "btn-icon-only" : ""} ${
        props?.className ?? ""
      }`}
    />
  );
};
