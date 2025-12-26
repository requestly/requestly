import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { VariableRow, VariablesList } from "../VariablesList/VariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { isEmpty } from "lodash";
import { convertEnvironmentToMap, isGlobalEnvironment, mapToEnvironmentArray } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { PostmanEnvironmentExportModal } from "features/apiClient/screens/apiClient/components/modals/postmanEnvironmentExportModal/PostmanEnvironmentExportModal";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import "./environmentView.scss";
import { EnvironmentVariablesList } from "../VariablesList/EnvironmentVariablesList";
import type { VariableRow } from "../VariablesList/VariablesList";
import {
  useEnvironmentByIdMemoized,
  useEnvironmentVariablesMemoized,
} from "features/apiClient/slices/environments/environments.hooks";
import { useBufferedEnvironmentEntity, useBufferIsDirty } from "features/apiClient/slices/entities/hooks";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { bufferActions } from "features/apiClient/slices/buffer";
import { updateEnvironmentVariables } from "features/apiClient/slices/environments/thunks";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";
import { useApiClientRepository } from "features/apiClient/contexts/meta";

interface EnvironmentViewProps {
  envId: string;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ envId }) => {
  const dispatch = useApiClientDispatch();
  // const repositories = useApiClientRepository();

  // Determine if this is global environment
  const isGlobal = envId === GLOBAL_ENVIRONMENT_ID;

  // Get environment data from Redux
  const environment = useEnvironmentByIdMemoized(envId);
  const sourceVariables = useEnvironmentVariablesMemoized(envId);

  // Get buffer state by referenceId (envId)
  const bufferEntry = useApiClientSelector((state) =>
    Object.values(state.buffer.entities).find((entry) => entry?.referenceId === envId)
  );
  const hasBuffer = bufferEntry !== null && bufferEntry !== undefined;
  const bufferId = bufferEntry?.id ?? null; 
  const isDirty = bufferId ? useBufferIsDirty(bufferId) : false;

  const bufferedEntity = useBufferedEnvironmentEntity(envId);


  const [searchValue, setSearchValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

  const environmentName = environment?.name ?? "";

  // Initialize buffer on mount - ONLY ONCE //TEMP
  useEffect(() => {
    if (!environment) return;

    dispatch(
      bufferActions.open({
        entityType: isGlobal ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT,
        isNew: false,
        referenceId: envId,
        data: environment,
      })
    );

    // Cleanup: close buffer on unmount
    return () => {
      if (bufferId) {
        dispatch(bufferActions.close(bufferId));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, envId, isGlobal, bufferId, environment]); // Added environment back, included bufferId

  const currentVariables = useMemo(() => {
    if (hasBuffer && bufferEntry?.current) {
      return (bufferEntry.current as { variables: typeof sourceVariables }).variables;
    }
    return sourceVariables;
  }, [hasBuffer, bufferEntry, sourceVariables]);

  // Convert to array format for the list
  const variablesData = useMemo(() => {
    return mapToEnvironmentArray(currentVariables);
  }, [currentVariables]);

  const pendingVariablesRef = useRef<VariableRow[]>([]);

  // FIXME: Saves last input value even when cleared
  const variables = useMemo(() => {
    return pendingVariablesRef.current.length > 0 ? pendingVariablesRef.current : variablesData;
  }, [variablesData]);

  const [pendingVariables, setPendingVariables] = useState<VariableRow[]>(variables);

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  const { setPreview, setUnsaved, setTitle } = useGenericState();

  useEffect(() => {
    // To sync title for tabs opened from deeplinks
    if (environmentName) {
      setTitle(environmentName);
    }
  }, [environmentName, setTitle]);

  useEffect(() => {
    setUnsaved(hasUnsavedChanges || isDirty);

    if (hasUnsavedChanges || isDirty) {
      setPreview(false);
    }
  }, [setUnsaved, setPreview, hasUnsavedChanges, isDirty]);

  useEffect(() => {
    if (!isSaving) {
      setPendingVariables(variables);
    }
  }, [variables, isSaving]);

  const handleSetPendingVariables = useCallback(
    (newVariables: VariableRow[]) => {
      setPendingVariables(newVariables);
      pendingVariablesRef.current = newVariables;

      if (hasBuffer && bufferId && bufferedEntity) {
        bufferedEntity.variables.clearAll();
        for (const v of newVariables) {
          if (v.key) {
            bufferedEntity.variables.add({
              key: v.key,
              type: v.type,
              localValue: v.localValue,
              syncValue: v.syncValue,
              isPersisted: true,
            });
          }
        }
      }
    },
    [hasBuffer, bufferId, bufferedEntity]
  );

  const handleSaveVariables = async () => {
    try {
      setIsSaving(true);

      const variablesToSave = convertEnvironmentToMap(pendingVariables);

      // // Persist to repository using thunk
      // await dispatch(
      //   updateEnvironmentVariables({
      //     environmentId: envId,
      //     variables: variablesToSave,
      //     repository: repositories.environmentVariablesRepository,
      //   })
      // ).unwrap();

      // Mark buffer as saved
      if (hasBuffer && bufferId && environment) {
        dispatch(
          bufferActions.markSaved({
            id: bufferId, // Use actual buffer ID (UUID), not envId
            savedData: { ...environment, variables: variablesToSave },
            referenceId: envId, // Environment ID is the reference
          })
        );
      }

      toast.success("Variables updated successfully");
      trackVariablesSaved({
        type: isGlobalEnvironment(envId) ? "global_variables" : "environment_variable",
        num_variables: pendingVariables.length,
      });

      resetChanges();
    } catch (error) {
      console.error("Failed to update variables", error);
      toast.error("Failed to update variables");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div key={envId} className="variables-list-view-container">
      <div className="variables-list-view">
        <VariablesListHeader
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          currentEnvironmentName={environmentName}
          environmentId={envId}
          onSave={handleSaveVariables}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          exportActions={{
            showExport: isGlobalEnvironment(envId),
            enableExport: !isEmpty(variables),
            onRequestlyExportClick: () => setIsExportModalOpen(true),
            onPostmanExportClick: () => setIsPostmanExportModalOpen(true),
          }}
        />
        <EnvironmentVariablesList
          searchValue={searchValue}
          pendingVariables={pendingVariables}
          handleSetPendingVariables={handleSetPendingVariables}
          onSearchValueChange={setSearchValue}
        />
        {isExportModalOpen && (
          <ApiClientExportModal
            exportType="environment"
            environments={[{ id: envId, name: environmentName, variables: convertEnvironmentToMap(variables) }]}
            isOpen={isExportModalOpen}
            onClose={() => {
              setIsExportModalOpen(false);
            }}
          />
        )}
        {isPostmanExportModalOpen && (
          <PostmanEnvironmentExportModal
            environments={[{ id: envId, name: environmentName, variables: convertEnvironmentToMap(variables) }]}
            isOpen={isPostmanExportModalOpen}
            onClose={() => {
              setIsPostmanExportModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
