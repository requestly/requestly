import React, { ReactNode } from "react";
import { RQInput } from "lib/design-system/components";
import "./authFormInput.scss";

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
  suffix?: string;
  autoFocus?: boolean;
}

export const AuthFormInput: React.FC<InputProps> = ({
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
    <div className="auth-form-input-wrapper">
      {typeof label === "string" ? <label htmlFor={id}>{label}</label> : label}
      <RQInput
        className="auth-form-input"
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
