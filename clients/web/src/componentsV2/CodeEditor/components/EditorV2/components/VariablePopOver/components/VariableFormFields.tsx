import React, { useCallback } from "react";
import { Input, InputNumber, Select, Switch } from "antd";
import { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
import { ScopeOption } from "../types";

interface VariableFormFieldsProps {
  formData: {
    type: EnvironmentVariableType;
    initialValue: VariableValueType;
    currentValue: VariableValueType;
    scope?: any;
  };
  onFormDataChange: (updates: Partial<VariableFormFieldsProps["formData"]>) => void;
  scopeOptions?: ScopeOption[];
  showScope?: boolean;
}

const typeOptions = [
  { value: EnvironmentVariableType.String, label: "String" },
  { value: EnvironmentVariableType.Number, label: "Number" },
  { value: EnvironmentVariableType.Boolean, label: "Boolean" },
  { value: EnvironmentVariableType.Secret, label: "Secret" },
];

export const VariableFormFields: React.FC<VariableFormFieldsProps> = ({
  formData,
  onFormDataChange,
  scopeOptions,
  showScope = false,
}) => {
  const handleTypeChange = useCallback(
    (newType: EnvironmentVariableType) => {
      let convertedInitialValue = formData.initialValue;
      let convertedCurrentValue = formData.currentValue;

      switch (newType) {
        case EnvironmentVariableType.Boolean:
          convertedInitialValue = Boolean(convertedInitialValue ?? true);
          convertedCurrentValue = Boolean(convertedCurrentValue ?? true);
          break;
        case EnvironmentVariableType.Number:
          convertedInitialValue = isNaN(Number(convertedInitialValue)) ? 0 : Number(convertedInitialValue);
          convertedCurrentValue = isNaN(Number(convertedCurrentValue)) ? 0 : Number(convertedCurrentValue);
          break;
        case EnvironmentVariableType.String:
        case EnvironmentVariableType.Secret:
          convertedInitialValue = String(convertedInitialValue ?? "");
          convertedCurrentValue = String(convertedCurrentValue ?? "");
          break;
      }

      onFormDataChange({
        type: newType,
        initialValue: convertedInitialValue,
        currentValue: convertedCurrentValue,
      });
    },
    [formData.initialValue, formData.currentValue, onFormDataChange]
  );

  const renderValueInput = useCallback(
    (fieldName: "initialValue" | "currentValue", value: any, type: EnvironmentVariableType) => {
      const onChange = (newValue: any) => {
        onFormDataChange({ [fieldName]: newValue });
      };

      switch (type) {
        case EnvironmentVariableType.String:
          return (
            <Input
              size="small"
              placeholder="Enter value"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="form-input"
            />
          );

        case EnvironmentVariableType.Secret:
          return (
            <Input.Password
              size="small"
              placeholder="Enter value"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="form-input"
              visibilityToggle={true}
            />
          );

        case EnvironmentVariableType.Number:
          return (
            <InputNumber
              type="number"
              size="small"
              placeholder="Enter value"
              value={value}
              onChange={onChange}
              controls={false}
              className="form-input"
            />
          );

        case EnvironmentVariableType.Boolean:
          return (
            <div className="form-input boolean-input">
              <Switch checked={Boolean(value)} onChange={(checked) => onChange(checked)} />
            </div>
          );

        default:
          return (
            <Input
              size="small"
              placeholder="Enter value"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="form-input"
            />
          );
      }
    },
    [onFormDataChange]
  );

  const renderScopeOption = (option: ScopeOption) => (
    <div className="scope-option">
      {option.icon && <span className="scope-option-icon">{option.icon}</span>}
      <span className="scope-option-label">{option.label}</span>
    </div>
  );

  return (
    <div className="create-variable-form">
      {/* Initial Value */}
      <div className="form-row">
        <label className="form-label">Initial value</label>
        <div className="form-input-wrapper">
          {renderValueInput("initialValue", formData.initialValue, formData.type)}
        </div>
      </div>

      {/* Current Value */}
      <div className="form-row">
        <label className="form-label">Current value</label>
        <div className="form-input-wrapper">
          {renderValueInput("currentValue", formData.currentValue, formData.type)}
        </div>
      </div>

      {/* Type */}
      <div className="form-row">
        <label className="form-label">Type</label>
        <Select
          size="small"
          value={formData.type}
          onChange={handleTypeChange}
          options={typeOptions}
          className="form-select"
          popupClassName="form-select-dropdown"
        />
      </div>

      {/* Scope - Conditionally shown */}
      {showScope && scopeOptions && (
        <div className="form-row">
          <label className="form-label">Scope</label>
          <Select
            size="small"
            labelInValue
            value={{
              value: formData.scope,
              label: renderScopeOption(scopeOptions.find((o) => o.value === formData.scope) || scopeOptions[0]),
            }}
            onChange={(val) => onFormDataChange({ scope: val.value })}
            className="form-select scope-select"
            popupClassName="form-select-dropdown"
            optionLabelProp="label"
          >
            {scopeOptions.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                label={renderScopeOption(option)}
              >
                {renderScopeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};
