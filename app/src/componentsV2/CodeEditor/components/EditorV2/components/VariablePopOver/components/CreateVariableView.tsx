import React, { useState, useEffect, useCallback } from "react";
import { Input, InputNumber, Select, Switch } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType } from "backend/environment/types";
import { CreateVariableViewProps, ScopeOption } from "../types";
import { useCreateVariable } from "../hooks/useCreateVariable";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { useGenericState } from "hooks/useGenericState";

export const CreateVariableView: React.FC<CreateVariableViewProps> = ({ variableName, onCancel, onSave }) => {
  const genericState = useGenericState();
  const collectionId = genericState.getSourceId();
  const { scopeOptions, defaultScope } = useScopeOptions(collectionId);
  const { createVariable, isCreating } = useCreateVariable(collectionId);

  const [formData, setFormData] = useState({
    scope: defaultScope,
    type: EnvironmentVariableType.String,
    initialValue: "",
    currentValue: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Update default scope when it changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, scope: defaultScope }));
  }, [defaultScope]);

  const validate = (): boolean => {
    const hasInitialValue = formData.initialValue !== "" && formData.initialValue !== undefined;

    const hasCurrentValue = formData.currentValue !== "" && formData.currentValue !== undefined;

    if (!hasInitialValue && !hasCurrentValue) {
      setValidationError("Please provide at least one value (Initial or Current)");
      return false;
    }

    // Type-specific validation
    if (formData.type === EnvironmentVariableType.Number) {
      // Explicitly reject empty or whitespace-only strings before converting to Number
      if (hasInitialValue && String(formData.initialValue).trim() === "") {
        setValidationError("Please provide valid number values");
        return false;
      }

      if (hasCurrentValue && String(formData.currentValue).trim() === "") {
        setValidationError("Please provide valid number values");
        return false;
      }

      // Only after non-empty checks, convert to Number and check for NaN
      const initialNum = Number(formData.initialValue);
      const currentNum = Number(formData.currentValue);

      if ((hasInitialValue && isNaN(initialNum)) || (hasCurrentValue && isNaN(currentNum))) {
        setValidationError("Please provide valid number values");
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleTypeChange = useCallback((newType: EnvironmentVariableType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      initialValue: "",
      currentValue: "",
    }));
  }, []);

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      const variableData = {
        variableName,
        ...formData,
      };
      await createVariable(variableData);
      await onSave(variableData);
    } catch (error) {
      // Error is already handled in useCreateVariable hook
      console.error("Error creating variable:", error);
    }
  };

  const typeOptions = [
    { value: EnvironmentVariableType.String, label: "String" },
    { value: EnvironmentVariableType.Number, label: "Number" },
    { value: EnvironmentVariableType.Boolean, label: "Boolean" },
    { value: EnvironmentVariableType.Secret, label: "Secret" },
  ];

  const renderValueInput = useCallback(
    (fieldName: "initialValue" | "currentValue", value: any, type: EnvironmentVariableType) => {
      const onChange = (newValue: any) => {
        setFormData((prev) => ({ ...prev, [fieldName]: newValue }));
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
              <Switch
                // size="small"
                checked={Boolean(value)}
                onChange={(checked) => onChange(checked)}
              />
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
    []
  );

  const renderScopeOption = (option: ScopeOption) => (
    <div className="scope-option">
      {option.icon && <span className="scope-option-icon">{option.icon}</span>}
      <span className="scope-option-label">{option.label}</span>
    </div>
  );

  return (
    <div className="create-variable-view">
      <div className="create-variable-header">
        <h3 className="create-variable-title">Add as a new variable</h3>
      </div>

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

        {/* Scope */}
        <div className="form-row">
          <label className="form-label">Scope</label>
          <Select
            size="small"
            labelInValue
            value={{
              value: formData.scope,
              label: renderScopeOption(scopeOptions.find((o) => o.value === formData.scope) || scopeOptions[0]),
            }}
            onChange={(val) => setFormData((prev) => ({ ...prev, scope: val.value }))}
            className="form-select scope-select"
            popupClassName="form-select-dropdown"
            optionLabelProp="label"
          >
            {scopeOptions.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                label={renderScopeOption(option)} // ensures icon shows in dropdown and selected display
              >
                {renderScopeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Validation Error */}
        {validationError && <div className="form-error">{validationError}</div>}
      </div>

      {/* Actions */}
      <div className="create-variable-actions">
        <RQButton onClick={onCancel} disabled={isCreating}>
          Cancel
        </RQButton>
        <RQButton type="primary" onClick={handleSave} loading={isCreating}>
          Save
        </RQButton>
      </div>
    </div>
  );
};
