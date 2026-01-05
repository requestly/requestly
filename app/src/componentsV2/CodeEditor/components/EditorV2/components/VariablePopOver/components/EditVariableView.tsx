import React, { useState, useMemo, useCallback } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { useSelector } from "react-redux";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { CreateVariableFormData, VariableUpsertSource } from "../types";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { captureException } from "backend/apiClient/utils";
import { VariableFormFields } from "./VariableFormFields";
import { FaListAlt } from "@react-icons/all-files/fa/FaListAlt";
import { toast } from "utils/Toast";
import { useCollectionIdByRecordId } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useHostContext } from "hooks/useHostContext";
import { useEntity, useEnvironmentEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { GLOBAL_ENVIRONMENT_ID, RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useActiveEnvironment, useApiClientFeatureContext } from "features/apiClient/slices";
import type { RootState } from "store/types";

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
  const { getSourceId } = useHostContext();
  const recordId = getSourceId();

  const collectionId = useCollectionIdByRecordId(recordId);
  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();

  const { scopeOptions } = useScopeOptions(collectionId);

  const [upserting, setUpserting] = useState(false);

  // Entity hooks for each scope - always call hooks unconditionally
  const globalEnvEntity = useEntity({
    id: GLOBAL_ENVIRONMENT_ID,
    type: ApiClientEntityType.GLOBAL_ENVIRONMENT,
  });

  // Use a fallback ID to ensure hook is always called
  const envEntity = useEnvironmentEntity(activeEnvironment?.id || "", ApiClientEntityType.ENVIRONMENT);

  const collectionEntity = useEntity({
    id: collectionId || "",
    type: ApiClientEntityType.COLLECTION_RECORD,
  });

  const runtimeEntity = useEntity({
    id: RUNTIME_VARIABLES_ENTITY_ID,
    type: ApiClientEntityType.RUNTIME_VARIABLES,
  });

  const globalVariables = useApiClientSelector((s) => globalEnvEntity.variables.getAll(s));
  const environmentVariables = useApiClientSelector((s) => (activeEnvironment ? envEntity.variables.getAll(s) : {}));
  const collectionVariables = useApiClientSelector((s) => (collectionId ? collectionEntity.variables.getAll(s) : {}));
  const runtimeVariables = useSelector((s: RootState) => runtimeEntity.variables.getAll(s));

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
      let scopeName: string;

      // Find existing variable to get its ID
      const findExistingVariable = (vars: Record<string, any>) => {
        return Object.entries(vars).find(([key]) => key === varName);
      };

      switch (scope) {
        case VariableScope.GLOBAL: {
          const existingVar = findExistingVariable(globalVariables);
          if (!existingVar) {
            throw new Error("Variable not found");
          }

          const [, variable] = existingVar;
          const updatedVariables = {
            ...globalVariables,
            [varName]: {
              ...variable,
              type,
              syncValue: initialValue ?? "",
              localValue: currentValue ?? "",
              isPersisted: true as const,
            },
          };

          await repositories.environmentVariablesRepository.updateEnvironment(GLOBAL_ENVIRONMENT_ID, {
            variables: updatedVariables,
          });

          globalEnvEntity.variables.set({
            id: variable.id,
            key: varName,
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
          });

          scopeName = "Global";
          break;
        }

        case VariableScope.ENVIRONMENT: {
          if (!activeEnvironment) {
            throw new Error("No active environment selected");
          }

          const existingVar = findExistingVariable(environmentVariables);
          if (!existingVar) {
            throw new Error("Variable not found");
          }

          const [, variable] = existingVar;
          const updatedVariables = {
            ...environmentVariables,
            [varName]: {
              ...variable,
              type,
              syncValue: initialValue ?? "",
              localValue: currentValue ?? "",
              isPersisted: true as const,
            },
          };

          await repositories.environmentVariablesRepository.updateEnvironment(activeEnvironment.id, {
            variables: updatedVariables,
          });

          envEntity.variables.set({
            id: variable.id,
            key: varName,
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
          });

          scopeName = activeEnvironment.name;
          break;
        }

        case VariableScope.COLLECTION: {
          if (!collectionId) {
            throw new Error("Collection variable update requires collection context");
          }

          const existingVar = findExistingVariable(collectionVariables);
          if (!existingVar) {
            throw new Error("Variable not found");
          }

          const [, variable] = existingVar;
          const updatedVariables = {
            ...collectionVariables,
            [varName]: {
              ...variable,
              type,
              syncValue: initialValue ?? "",
              localValue: currentValue ?? "",
              isPersisted: true as const,
            },
          };

          await repositories.apiClientRecordsRepository.setCollectionVariables(collectionId, updatedVariables);

          collectionEntity.variables.set({
            id: variable.id,
            key: varName,
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
          });

          scopeName = "Collection";
          break;
        }

        case VariableScope.RUNTIME: {
          const existingVar = findExistingVariable(runtimeVariables);
          if (!existingVar) {
            throw new Error("Variable not found");
          }

          const [, variable] = existingVar;
          const runtimeValue = currentValue ?? initialValue ?? "";

          runtimeEntity.variables.set({
            id: variable.id,
            key: varName,
            type,
            localValue: runtimeValue,
          });

          scopeName = "Runtime";
          break;
        }

        default:
          throw new Error(`Unknown scope: ${scope}`);
      }

      await onSave(variableData);
      toast.success(`Variable updated in ${scopeName || existingVariable.scopeName}`);
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
  }, [
    variableName,
    formData,
    globalVariables,
    environmentVariables,
    collectionVariables,
    runtimeVariables,
    globalEnvEntity,
    envEntity,
    collectionEntity,
    runtimeEntity,
    activeEnvironment,
    collectionId,
    repositories,
    existingVariable.scopeName,
    onSave,
  ]);

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
