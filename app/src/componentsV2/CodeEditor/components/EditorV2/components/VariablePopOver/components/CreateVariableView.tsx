import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input, InputNumber, Select, Switch } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { CreateVariableFormData, ScopeOption } from "../types";
import { useCreateVariable } from "../hooks/useCreateVariable";
import { useUpdateVariable } from "../hooks/useUpdateVariable";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { useGenericState } from "hooks/useGenericState";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { RQAPI } from "features/apiClient/types";
import { FaListAlt } from "@react-icons/all-files/fa/FaListAlt";
import { captureException } from "backend/apiClient/utils";

interface ExistingVariableData {
  type: EnvironmentVariableType;
  syncValue: VariableValueType;
  localValue: VariableValueType;
  scope: VariableScope;
  scopeName: String;
}

interface CreateVariableViewProps {
  variableName: string;
  mode: "create" | "edit";
  existingVariable?: ExistingVariableData;
  onCancel: () => void;
  onSave: (data: CreateVariableFormData) => Promise<void>;
}

export const CreateVariableView: React.FC<CreateVariableViewProps> = ({
  variableName,
  mode = "create",
  existingVariable,
  onCancel,
  onSave,
}) => {
  const genericState = useGenericState();
  const [getData] = useAPIRecords((state) => [state.getData]);
  const recordId = genericState.getSourceId();

  // Determine the collection ID based on the current record
  const collectionId = useMemo(() => {
    if (!recordId) {
      return undefined;
    }

    const record = getData(recordId);

    if (!record) {
      return undefined;
    }

    // If the current record is a collection, use its ID
    if (record.type === RQAPI.RecordType.COLLECTION) {
      return record.id;
    }

    // If the current record is a request, use its parent collection ID
    if (record.type === RQAPI.RecordType.API) {
      return record.collectionId || undefined;
    }

    return undefined;
  }, [recordId, getData]);

  const { scopeOptions, defaultScope } = useScopeOptions(collectionId);
  const { createVariable, status: createStatus } = useCreateVariable(collectionId);
  const { updateVariable, isUpdating } = useUpdateVariable(collectionId);

  // Initialize form data based on mode
  const [formData, setFormData] = useState(() => {
    if (mode === "edit" && existingVariable) {
      return {
        scope: existingVariable.scope,
        type: existingVariable.type,
        initialValue: existingVariable.syncValue ?? "",
        currentValue: existingVariable.localValue ?? "",
      };
    }
    return {
      scope: defaultScope,
      type: EnvironmentVariableType.String,
      initialValue: "" as VariableValueType,
      currentValue: "" as VariableValueType,
    };
  });

  // Update default scope when it changes
  useEffect(() => {
    if (mode === "create") {
      setFormData((prev) => ({ ...prev, scope: defaultScope }));
    }
  }, [defaultScope, mode]);

  const handleTypeChange = useCallback((newType: EnvironmentVariableType) => {
    setFormData((prev) => {
      let convertedInitialValue = prev.initialValue;
      let convertedCurrentValue = prev.currentValue;

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

      return {
        ...prev,
        type: newType,
        initialValue: convertedInitialValue,
        currentValue: convertedCurrentValue,
      };
    });
  }, []);

  const handleSave = async () => {
    try {
      const variableData = {
        variableName,
        ...formData,
      };

      if (mode === "edit") {
        await updateVariable(variableData);
      } else {
        await createVariable(variableData);
      }

      await onSave(variableData);
    } catch (error) {
      captureException(error);
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
    []
  );

  const renderScopeOption = (option: ScopeOption) => (
    <div className="scope-option">
      {option.icon && <span className="scope-option-icon">{option.icon}</span>}
      <span className="scope-option-label">{option.label}</span>
    </div>
  );

  const isProcessing = mode === "edit" ? isUpdating : createStatus.creating;

  // Get scope information for edit mode header
  const currentScopeOption = useMemo(() => {
    if (mode === "edit" && existingVariable) {
      return scopeOptions.find((o) => o.value === existingVariable.scope) || scopeOptions[0];
    }
    return null;
  }, [mode, existingVariable, scopeOptions]);

  console.log({ scopeOptions, existingVariable });
  return (
    <div className="create-variable-view">
      {mode === "edit" ? (
        <>
          {/* Edit Mode Header */}
          <div className="edit-variable-header">
            <div className="edit-variable-scope-info">
              <div className="scope-icon-wrapper">{currentScopeOption?.icon || <FaListAlt />}</div>
              <span className="scope-name">{existingVariable?.scopeName || "Environment"}</span>
            </div>
            <div className="edit-variable-actions">
              <RQButton size="small" onClick={onCancel} disabled={isProcessing}>
                Cancel
              </RQButton>
              <RQButton size="small" type="primary" onClick={handleSave} loading={isProcessing}>
                {isProcessing ? "" : "Save"}
              </RQButton>
            </div>
          </div>
        </>
      ) : (
        /* Create Mode Header */
        <div className="create-variable-header">
          <h3 className="create-variable-title">Add as a new variable</h3>
        </div>
      )}

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

        {/* Scope - Only show in create mode */}
        {mode === "create" && (
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
        )}
      </div>

      {/* Actions - Only show in create mode (edit mode has actions in header) */}
      {mode === "create" && (
        <div className="create-variable-actions">
          <RQButton size="large" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </RQButton>
          <RQButton size="large" type="primary" onClick={handleSave} loading={isProcessing}>
            {isProcessing ? "" : "Save"}
          </RQButton>
        </div>
      )}
    </div>
  );
};
