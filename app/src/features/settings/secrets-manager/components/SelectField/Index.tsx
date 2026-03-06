import React, { ReactNode } from "react";
import { Select } from "antd";
import "./index.scss";
interface SelectFieldProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  options: any[];
  handleFilterChange?: (value: string) => void;
  emptyState?: ReactNode;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  options,
  handleFilterChange,
  emptyState,
  disabled,
}) => {
  return (
    <div className="form-select-wrapper">
      {typeof label === "string" ? (
        <label htmlFor={id} className="form-select-label">
          {label}
        </label>
      ) : (
        label
      )}
      <Select
        id={id}
        className="form-select"
        value={value}
        options={options}
        onChange={handleFilterChange}
        notFoundContent="No options available"
        disabled={disabled}
      />
    </div>
  );
};
