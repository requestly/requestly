import React, { ReactNode } from "react";
import { RQInput } from "lib/design-system/components";

interface InputProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  placeholder: string;
  type?: string;
  onValueChange: (value: string) => void;
  onPressEnter?: () => void;
  status?: "error" | "warning";
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
}) => {
  return (
    <div className="onboarding-form-input">
      {typeof label === "string" ? <label htmlFor={id}>{label}</label> : label}
      <RQInput
        type={type ?? "text"}
        onPressEnter={onPressEnter}
        placeholder={placeholder}
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        status={status ?? ""}
      />
    </div>
  );
};
