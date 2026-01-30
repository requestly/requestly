import type React from "react";
import { useState, useMemo, useCallback } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { VariableScope } from "backend/environment/types";
import type { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
import type { CreateVariableFormData } from "../types";
import { VariableUpsertSource } from "../types";
import { getScopeIcon } from "../hooks/useScopeOptions";
import { captureException } from "backend/apiClient/utils";
import { VariableFormFields } from "./VariableFormFields";
import { FaListAlt } from "@react-icons/all-files/fa/FaListAlt";
import { toast } from "utils/Toast";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { parseRawVariable, mergeVariable } from "../utils/variableUtils";
import { useVariableScopeAdapter } from "../hooks/useVariableScopeAdapter";

interface ExistingVariableData {
  type: EnvironmentVariableType;
  syncValue: VariableValueType;
  localValue: VariableValueType;
  scope: VariableScope;
  scopeId: string;
  scopeName: string;
}

interface EditVariableViewProps {
  variableName: string;
  existingVariable: ExistingVariableData;
  onCancel: () => void;
  onSave: (data: CreateVariableFormData) => Promise<void>;
}

export const EditVariableView: React.FC<EditVariableViewProps> = ({
  variableName,
  existingVariable,
  onCancel,
  onSave,
}) => {
  const [upserting, setUpserting] = useState(false);

  const { entity, saveVariablesToRepository, scopeDisplayName, store } = useVariableScopeAdapter(
    existingVariable.scope,
    [],
    { scopeId: existingVariable.scopeId, scopeDisplayName: existingVariable.scopeName }
  );

  const [formData, setFormData] = useState({
    scope: existingVariable.scope,
    type: existingVariable.type,
    initialValue: existingVariable.syncValue ?? "",
    currentValue: existingVariable.localValue ?? "",
  });

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = useCallback(async () => {
    setUpserting(true);
    try {
      const variableData = {
        variableName,
        ...formData,
      };

      const { variableName: varName, scope, type, initialValue, currentValue } = variableData;

      const state = store.getState();
      const currentVariables = entity.variables.getAll(state);

      const existingVariableEntry = Object.entries(currentVariables).find(([key]) => key === varName);
      if (!existingVariableEntry) {
        throw new Error("Variable not found");
      }
      const [, existingVar] = existingVariableEntry;
      const existingId = String(existingVar.id);

      const { key, variable } = parseRawVariable(varName, { type, initialValue, currentValue }, existingId);

      const updatedVariables = mergeVariable(currentVariables, key, variable);

      await saveVariablesToRepository(updatedVariables);

      entity.variables.set({
        id: existingId,
        key,
        type: variable.type,
        syncValue: variable.syncValue,
        localValue: variable.localValue,
      });

      await onSave(variableData);
      toast.success(`Variable updated in ${scopeDisplayName}`);
      trackVariablesSaved({
        source: VariableUpsertSource.VARIABLE_POPOVER,
        variable_scope: scope.toLowerCase(),
      });
    } catch (error) {
      toast.error("Failed to update variable");
      captureException(error);
    } finally {
      setUpserting(false);
    }
  }, [variableName, formData, store, entity, saveVariablesToRepository, scopeDisplayName, onSave]);

  const scopeIcon = useMemo(() => {
    return getScopeIcon(existingVariable.scope) || <FaListAlt />;
  }, [existingVariable.scope]);

  return (
    <div className="create-variable-view">
      <div className="edit-variable-header">
        <div className="edit-variable-scope-info">
          <div className="scope-icon-wrapper">{scopeIcon}</div>
          <span className="scope-name">{existingVariable.scopeName || "Environment"}</span>
        </div>
        <div className="edit-variable-actions">
          <RQButton size="small" onClick={onCancel} disabled={upserting}>
            Cancel
          </RQButton>
          <RQButton size="small" type="primary" onClick={handleSave} loading={upserting}>
            {upserting ? "" : "Save"}
          </RQButton>
        </div>
      </div>

      <VariableFormFields formData={formData} onFormDataChange={handleFormDataChange} showScope={false} />
    </div>
  );
};
