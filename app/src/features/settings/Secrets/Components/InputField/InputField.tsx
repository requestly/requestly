import React, { ReactNode } from "react";
import "./index.scss";
import { Input } from "antd";

interface InputProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  placeholder: string;
  type?: string;
  onValueChange: (value: string) => void;
  onPressEnter?: () => void;
  status?: "error" | "warning";
  disabled?: boolean;
  suffix?: string | ReactNode;
  autoFocus?: boolean;
}

export const InputField: React.FC<InputProps> = ({
  id,
  value,
  label,
  placeholder,
  onValueChange,
  onPressEnter,
  type,
  status,
  disabled = false,
  suffix,
  autoFocus = false,
}) => {
  return (
    <div className="form-input-wrapper">
      {typeof label === "string" ? (
        <label htmlFor={id} className="form-input-label">
          {label}
        </label>
      ) : (
        label
      )}
      <Input
        className="form-input non-password"
        type={type ?? "text"}
        onPressEnter={onPressEnter}
        placeholder={placeholder}
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        status={status ?? ""}
        disabled={disabled}
        suffix={suffix}
        autoFocus={autoFocus}
      />
    </div>
  );
};
