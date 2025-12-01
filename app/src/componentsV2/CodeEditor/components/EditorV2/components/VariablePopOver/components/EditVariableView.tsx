import React, { useState, useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { CreateVariableFormData, VariableUpsertSource } from "../types";
import { useUpsertVariable } from "../hooks/useUpsertVariable";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { useGenericState } from "hooks/useGenericState";
import { captureException } from "backend/apiClient/utils";
import { VariableFormFields } from "./VariableFormFields";
import { FaListAlt } from "@react-icons/all-files/fa/FaListAlt";
import { toast } from "utils/Toast";
import { getCollectionIdByRecordId } from "../utils/utils";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";

interface ExistingVariableData {
  type: EnvironmentVariableType;
  syncValue: VariableValueType;
  localValue: VariableValueType;
  scope: VariableScope;
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
  const genericState = useGenericState();
  const apiClientCtx = useApiClientFeatureContext();
  const recordId = genericState.getSourceId();

  const collectionId = useMemo(() => {
    return getCollectionIdByRecordId(apiClientCtx, recordId);
  }, [apiClientCtx, recordId]);

  const { scopeOptions } = useScopeOptions(collectionId);
  const { upsertVariable, status } = useUpsertVariable(collectionId);

  const [formData, setFormData] = useState({
    scope: existingVariable.scope,
    type: existingVariable.type,
    initialValue: existingVariable.syncValue ?? "",
    currentValue: existingVariable.localValue ?? "",
  });

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      const variableData = {
        variableName,
        ...formData,
      };

      const result = await upsertVariable(variableData, "update");

      if (!result.success) {
        toast.error("Failed to update variable");
        return;
      }

      await onSave(variableData);
      toast.success(`Variable updated in ${result.scopeName || existingVariable.scopeName}`);
      trackVariablesSaved({
        source: VariableUpsertSource.VARIABLE_POPOVER,
        variable_scope: formData.scope.toLowerCase(),
      });
    } catch (error) {
      toast.error("Failed to update variable");
      captureException(error);
    }
  };

  const currentScopeOption = useMemo(() => {
    return scopeOptions.find((o) => o.value === existingVariable.scope) || scopeOptions[0];
  }, [existingVariable.scope, scopeOptions]);

  return (
    <div className="create-variable-view">
      <div className="edit-variable-header">
        <div className="edit-variable-scope-info">
          <div className="scope-icon-wrapper">{currentScopeOption?.icon || <FaListAlt />}</div>
          <span className="scope-name">{existingVariable.scopeName || "Environment"}</span>
        </div>
        <div className="edit-variable-actions">
          <RQButton size="small" onClick={onCancel} disabled={status.upserting}>
            Cancel
          </RQButton>
          <RQButton size="small" type="primary" onClick={handleSave} loading={status.upserting}>
            {status.upserting ? "" : "Save"}
          </RQButton>
        </div>
      </div>

      <VariableFormFields formData={formData} onFormDataChange={handleFormDataChange} showScope={false} />
    </div>
  );
};
