import React, { useState, useEffect, useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType, VariableValueType } from "backend/environment/types";
import { CreateVariableFormData } from "../types";
import { useUpsertVariable } from "../hooks/useUpsertVariable";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { useGenericState } from "hooks/useGenericState";
import { captureException } from "backend/apiClient/utils";
import { VariableFormFields } from "./VariableFormFields";
import { toast } from "utils/Toast";
import { getCollectionIdByRecordId } from "../utils/utils";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";

interface CreateVariableViewProps {
  variableName: string;
  onCancel: () => void;
  onSave: (data: CreateVariableFormData) => Promise<void>;
}

export const CreateVariableView: React.FC<CreateVariableViewProps> = ({ variableName, onCancel, onSave }) => {
  const genericState = useGenericState();
  const apiClientCtx = useApiClientFeatureContext();
  const recordId = genericState.getSourceId();

  // Determine the collection ID based on the current record using shared util
  const collectionId = useMemo(() => {
    return getCollectionIdByRecordId(apiClientCtx, recordId);
  }, [apiClientCtx, recordId]);

  const { scopeOptions, defaultScope } = useScopeOptions(collectionId);
  const { upsertVariable, status } = useUpsertVariable(collectionId);

  const [formData, setFormData] = useState({
    scope: defaultScope,
    type: EnvironmentVariableType.String,
    initialValue: "" as VariableValueType,
    currentValue: "" as VariableValueType,
  });

  // Update default scope when it changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, scope: defaultScope }));
  }, [defaultScope]);

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      const variableData = {
        variableName,
        ...formData,
      };

      const result = await upsertVariable(variableData, "create");

      await onSave(variableData);
      // Show success toast
      toast.success(`Variable created in ${result.scopeName || "scope"}`);
      trackVariablesSaved({
        source: "variable popover",
      });
    } catch (error) {
      // Show error toast
      toast.error("Failed to create variable");
      captureException(error);
    }
  };

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
        <RQButton size="large" onClick={onCancel} disabled={status.upserting}>
          Cancel
        </RQButton>
        <RQButton size="large" type="primary" onClick={handleSave} loading={status.upserting}>
          {status.upserting ? "" : "Save"}
        </RQButton>
      </div>
    </div>
  );
};
