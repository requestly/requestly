import React, { useState, useEffect, useCallback } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { CreateVariableFormData, VariableUpsertSource } from "../types";
import { useScopeOptions } from "../hooks/useScopeOptions";
import { captureException } from "backend/apiClient/utils";
import { VariableFormFields } from "./VariableFormFields";
import { toast } from "utils/Toast";
import { useCollectionIdByRecordId } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { trackVariableCreated } from "modules/analytics/events/features/apiClient";
import { useHostContext } from "hooks/useHostContext";
import { useEntity, useEnvironmentEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { GLOBAL_ENVIRONMENT_ID, RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useActiveEnvironment, useApiClientFeatureContext } from "features/apiClient/slices";
import { v4 as uuidv4 } from "uuid";

interface CreateVariableViewProps {
  variableName: string;
  onCancel: () => void;
  onSave: (data: CreateVariableFormData) => Promise<void>;
}

export const CreateVariableView: React.FC<CreateVariableViewProps> = ({ variableName, onCancel, onSave }) => {
  const { getSourceId } = useHostContext();
  const recordId = getSourceId();

  const collectionId = useCollectionIdByRecordId(recordId);
  const activeEnvironment = useActiveEnvironment();
  const { repositories } = useApiClientFeatureContext();

  const { scopeOptions, defaultScope } = useScopeOptions(collectionId);

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

  const [formData, setFormData] = useState({
    scope: defaultScope,
    type: EnvironmentVariableType.String,
    initialValue: "" as VariableValueType,
    currentValue: "" as VariableValueType,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, scope: defaultScope }));
  }, [defaultScope]);

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const getVariableScopeForAnalytics = (scope: VariableScope | string) => {
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

      switch (scope) {
        case VariableScope.GLOBAL: {
          const newId = uuidv4();

          const updatedVariables = {
            ...globalVariables,
            [varName]: {
              id: newId,
              type,
              syncValue: initialValue ?? "",
              localValue: currentValue ?? "",
              isPersisted: true as const,
            },
          };

          await repositories.environmentVariablesRepository.updateEnvironment(GLOBAL_ENVIRONMENT_ID, {
            variables: updatedVariables,
          });

          globalEnvEntity.variables.add({
            key: varName,
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
            isPersisted: true,
          });

          scopeName = "Global";
          break;
        }

        case VariableScope.ENVIRONMENT: {
          if (!activeEnvironment) {
            throw new Error("No active environment selected");
          }

          const newId = uuidv4();

          const updatedVariables = {
            ...environmentVariables,
            [varName]: {
              id: newId,
              type,
              syncValue: initialValue ?? "",
              localValue: currentValue ?? "",
              isPersisted: true as const,
            },
          };

          await repositories.environmentVariablesRepository.updateEnvironment(activeEnvironment.id, {
            variables: updatedVariables,
          });

          envEntity.variables.add({
            key: varName,
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
            isPersisted: true,
          });

          scopeName = activeEnvironment.name;
          break;
        }

        case VariableScope.COLLECTION: {
          if (!collectionId) {
            throw new Error("Collection variable creation requires collection context");
          }

          const newId = uuidv4();

          const updatedVariables = {
            ...collectionVariables,
            [varName]: {
              id: newId,
              type,
              syncValue: initialValue ?? "",
              localValue: currentValue ?? "",
              isPersisted: true as const,
            },
          };

          await repositories.apiClientRecordsRepository.setCollectionVariables(collectionId, updatedVariables);

          collectionEntity.variables.add({
            key: varName,
            type,
            syncValue: initialValue ?? "",
            localValue: currentValue ?? "",
            isPersisted: true,
          });

          scopeName = "Collection";
          break;
        }

        case VariableScope.RUNTIME: {
          const runtimeValue = currentValue ?? initialValue ?? "";

          runtimeEntity.variables.add({
            key: varName,
            type,
            localValue: runtimeValue,
            isPersisted: true,
          });

          scopeName = "Runtime";
          break;
        }

        default:
          throw new Error(`Unknown scope: ${scope}`);
      }

      await onSave(variableData);
      toast.success(`Variable created in ${scopeName}`);
      trackVariableCreated({
        source: VariableUpsertSource.VARIABLE_POPOVER,
        variable_scope: getVariableScopeForAnalytics(scope),
      });
    } catch (error) {
      toast.error("Failed to create variable");
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
    globalEnvEntity,
    envEntity,
    collectionEntity,
    runtimeEntity,
    activeEnvironment,
    collectionId,
    repositories,
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
