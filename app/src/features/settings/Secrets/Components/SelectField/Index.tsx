import React, { ReactNode } from "react";
import { Select } from "antd";
import "./index.scss";
interface SelectFieldProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  options: [];
  handleFilterChange?: (options: []) => void;
  emptyState?: ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, options, handleFilterChange }) => {
  return (
    <div className="form-select-wrapper">
      {typeof label === "string" ? (
        <label htmlFor={id} className="form-select-label">
          {label}
        </label>
      ) : (
        label
      )}
      <Select id={id} className="form-select" value={value} options={options} onChange={handleFilterChange} />
    </div>
  );
};
