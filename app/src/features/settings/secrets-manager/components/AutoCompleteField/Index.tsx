import React, { ReactNode } from "react";
import { AutoComplete } from "antd";
import "./index.scss";

interface AutoCompleteFieldProps {
  id?: string;
  value: string;
  label: ReactNode | string;
  options: any[];
  handleFilterChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  filterOption?: (inputValue: string, option: any) => boolean;
}

export const AutoCompleteField: React.FC<AutoCompleteFieldProps> = ({
  id,
  label,
  value,
  options,
  handleFilterChange,
  placeholder,
  disabled,
  filterOption,
}) => {
  const defaultFilterOption = (inputValue: string, option: any) => {
    return (
      option!.label.toString().toLowerCase().includes(inputValue.toLowerCase()) ||
      option!.value.toString().toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // Find the label for the current value to display
  const displayValue = React.useMemo(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : value;
  }, [options, value]);

  const handleChange = (selectedValue: string) => {
    // When user types freely, pass the typed value
    // When user selects an option, pass the option's value
    const selectedOption = options.find((opt) => opt.label === selectedValue || opt.value === selectedValue);
    handleFilterChange?.(selectedOption ? selectedOption.value : selectedValue);
  };

  return (
    <div className="form-autocomplete-wrapper">
      {typeof label === "string" ? (
        <label htmlFor={id} className="form-autocomplete-label">
          {label}
        </label>
      ) : (
        label
      )}
      <AutoComplete
        id={id}
        className="form-autocomplete"
        value={displayValue}
        options={options}
        onChange={handleChange}
        placeholder={placeholder}
        filterOption={filterOption || defaultFilterOption}
        disabled={disabled}
        notFoundContent="No options available"
        popupClassName="form-autocomplete-dropdown"
      />
    </div>
  );
};
