import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType, VariableScope } from "backend/environment/types";
import type { VariableValueType } from "backend/environment/types";
import type { CreateVariableFormData } from "../types";
import { VariableUpsertSource } from "../types";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { captureException } from "backend/apiClient/utils";
import { VariableFormFields } from "./VariableFormFields";
import { toast } from "utils/Toast";
import { useCollectionIdByRecordId } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { trackVariableCreated } from "modules/analytics/events/features/apiClient";
import { useHostContext } from "hooks/useHostContext";
import { parseRawVariable, mergeVariable } from "../utils/variableUtils";
import { useVariableScopeAdapter } from "../hooks/useVariableScopeAdapter";

interface CreateVariableViewProps {
  variableName: string;
  onCancel: () => void;
  onSave: (data: CreateVariableFormData) => Promise<void>;
}

export const CreateVariableView: React.FC<CreateVariableViewProps> = ({ variableName, onCancel, onSave }) => {
  const { getSourceId } = useHostContext();
  const recordId = getSourceId();

  const collectionId = useCollectionIdByRecordId(recordId);

  const { scopeOptions, defaultScope } = useScopeOptions(collectionId);

  const [upserting, setUpserting] = useState(false);

  const [formData, setFormData] = useState({
    scope: defaultScope,
    type: EnvironmentVariableType.String,
    initialValue: "" as VariableValueType,
    currentValue: "" as VariableValueType,
  });

  const { entity, saveVariablesToRepository, scopeDisplayName, store } = useVariableScopeAdapter(formData.scope);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, scope: defaultScope }));
  }, [defaultScope]);

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const getVariableScopeForAnalytics = useCallback((scope: VariableScope | string) => {
    switch (scope) {
      case VariableScope.RUNTIME:
        return "runtime";
      case VariableScope.GLOBAL:
        return "global";
      case VariableScope.ENVIRONMENT:
        return "environment";
      case VariableScope.COLLECTION:
        return "collection";
      default:
        return "runtime";
    }
  }, []);

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
      const { key, variable } = parseRawVariable(varName, { type, initialValue, currentValue });

      const updatedVariables = mergeVariable(currentVariables, key, variable);
      if (scope !== VariableScope.RUNTIME) {
        await saveVariablesToRepository(updatedVariables);
      }

      entity.variables.add({
        id: variable.id,
        key,
        type: variable.type,
        syncValue: variable.syncValue,
        localValue: variable.localValue,
        isPersisted: variable.isPersisted,
      });

      await onSave(variableData);
      toast.success(`Variable created in ${scopeDisplayName}`);
      trackVariableCreated({
        source: VariableUpsertSource.VARIABLE_POPOVER,
        variable_scope: getVariableScopeForAnalytics(scope),
      });
    } catch (error) {
      console.log({ error });
      toast.error("Failed to create variable");
      captureException(error);
    } finally {
      setUpserting(false);
    }
  }, [
    variableName,
    formData,
    store,
    entity,
    saveVariablesToRepository,
    scopeDisplayName,
    onSave,
    getVariableScopeForAnalytics,
  ]);

  return (
    <div className="create-variable-view">
      <div className="create-variable-header">
        <h3 className="create-variable-title">Add as a new variable</h3>
      </div>

      <VariableFormFields
        formData={formData}
        onFormDataChange={handleFormDataChange}
        scopeOptions={scopeOptions}
        showScope={true}
      />

      <div className="create-variable-actions">
        <RQButton size="large" onClick={onCancel} disabled={upserting}>
          Cancel
        </RQButton>
        <RQButton size="large" type="primary" onClick={handleSave} loading={upserting}>
          {upserting ? "" : "Save"}
        </RQButton>
      </div>
    </div>
  );
};
