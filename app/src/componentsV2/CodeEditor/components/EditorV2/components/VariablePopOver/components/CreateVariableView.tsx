import React, { useState, useEffect } from "react";
import { Input, Select } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType } from "backend/environment/types";
import { CreateVariableViewProps, ScopeOption } from "../types";
import { useCreateVariable } from "../hooks/useCreateVariable";
import { useScopeOptions } from "../hooks/useScopeOptions";

export const CreateVariableView: React.FC<CreateVariableViewProps> = ({
  variableName,
  onCancel,
  onSave,
  collectionId,
}) => {
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
    if (!formData.initialValue && !formData.currentValue) {
      setValidationError("Please provide at least one value (Initial or Current)");
      return false;
    }
    setValidationError(null);
    return true;
  };

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

  const isSecret = formData.type === EnvironmentVariableType.Secret;

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
            {isSecret ? (
              <Input.Password
                size="small"
                placeholder="Enter value"
                value={formData.initialValue}
                onChange={(e) => setFormData({ ...formData, initialValue: e.target.value })}
                className="form-input"
                visibilityToggle={true}
              />
            ) : (
              <Input
                size="small"
                placeholder="Enter value"
                value={formData.initialValue}
                onChange={(e) => setFormData({ ...formData, initialValue: e.target.value })}
                className="form-input"
              />
            )}
          </div>
        </div>

        {/* Current Value */}

        <div className="form-row">
          <label className="form-label">Current value</label>
          <div className="form-input-wrapper">
            {isSecret ? (
              <Input.Password
                size="small"
                placeholder="Enter value"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className="form-input"
                visibilityToggle={true}
              />
            ) : (
              <Input
                size="small"
                placeholder="Enter value"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className="form-input"
              />
            )}
          </div>
        </div>

        {/* Type */}
        <div className="form-row">
          <label className="form-label">Type</label>
          <Select
            size="small"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
            options={typeOptions}
            className="form-select"
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
            onChange={(val) => setFormData({ ...formData, scope: val.value })}
            className="form-select scope-select"
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
