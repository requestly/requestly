import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { mapToEnvironmentArray } from "../../utils";
import "./environmentView.scss";
import type { VariableRow } from "../VariablesList/VariablesList";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import type {
  BufferedEnvironmentEntity,
  BufferedGlobalEnvironmentEntity,
} from "features/apiClient/slices/entities/buffered/environment";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { useApiClientRepository } from "features/apiClient/slices";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { isEmpty } from "lodash";
import { EnvironmentVariablesList } from "../VariablesList/EnvironmentVariablesList";

interface EnvironmentViewProps {
  entity: BufferedEnvironmentEntity | BufferedGlobalEnvironmentEntity;
  environmentId: string;
  isGlobal: boolean;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ entity, environmentId, isGlobal }) => {
  const dispatch = useApiClientDispatch();
  const workspaceId = useWorkspaceId();

  const repositories = useApiClientRepository(workspaceId);
  const state = useApiClientSelector((s) => s);
  const environmentName = entity.getName(state);

  const variablesData = useMemo(() => {
    return mapToEnvironmentArray(entity.variables.getAll(state) ?? []);
  }, [entity, state]);

  // FIXME: Saves last input value even when cleared
  const pendingVariablesRef = useRef<VariableRow[]>([]);
  const variables = useMemo(() => {
    return pendingVariablesRef.current.length > 0 ? pendingVariablesRef.current : variablesData;
  }, [variablesData]);

  // const [pendingVariables, setPendingVariables] = useState<VariableRow[]>(variables);

  const [searchValue, setSearchValue] = useState("");

  // const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  // const { setPreview, setUnsaved, setTitle } = useGenericState();

  // useEffect(() => {
  //   // To sync title for tabs opened from deeplinks
  //   if (environmentName) {
  //     setTitle(environmentName);
  //   }
  // }, [environmentName, setTitle]);

  // useEffect(() => {
  //   setUnsaved(hasUnsavedChanges);

  //   if (hasUnsavedChanges) {
  //     setPreview(false);
  //   }
  // }, [setUnsaved, setPreview, hasUnsavedChanges]);

  // useEffect(() => {
  //   if (!isSaving) {
  //     setPendingVariables(variables);
  //   }
  // }, [variables, isSaving]);

  const handleSetPendingVariables = useCallback(
    (newVariables: VariableRow[]) => {
      setPendingVariables(newVariables);
      pendingVariablesRef.current = newVariables;

      // Update entity variables
      entity.variables.clearAll();
      for (const v of newVariables) {
        if (v.key) {
          entity.variables.add({
            key: v.key,
            type: v.type,
            localValue: v.localValue,
            syncValue: v.syncValue,
            isPersisted: true,
          });
        }
      }
    },
    [entity]
  );

  const handleSaveVariables = async () => {
    // if (!bufferId) return;
    // try {
    //   setIsSaving(true);
    //   const variablesToSave = convertEnvironmentToMap(pendingVariables);
    //   const currentEnvironment = entity.getEntityFromState(state);
    //   dispatch(
    //     bufferActions.markSaved({
    //       id: bufferId,
    //       savedData: { ...currentEnvironment, variables: variablesToSave },
    //       referenceId: envId,
    //     })
    //   );
    //   resetChanges();
    // } catch (error) {
    //   console.error("Failed to update variables", error);
    // } finally {
    //   setIsSaving(false);
    // }
  };

  return (
    <div key={environmentId} className="variables-list-view-container">
      <div className="variables-list-view">
        <VariablesListHeader
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          currentEnvironmentName={environmentName}
          environmentId={environmentId}
          onSave={handleSaveVariables}
          exportActions={{
            showExport: isGlobal,
            enableExport: !isEmpty(variables),
            onRequestlyExportClick: () => {},
            onPostmanExportClick: () => {},
          }}
        />
        <EnvironmentVariablesList
          searchValue={"searchValue"}
          pendingVariables={pendingVariables}
          handleSetPendingVariables={handleSetPendingVariables}
          onSearchValueChange={() => {}}
        />
        {/* {isExportModalOpen && (
          <ApiClientExportModal
            exportType="environment"
            environments={[{ id: environmentId, name: environmentName, variables: convertEnvironmentToMap(variables) }]}
            isOpen={isExportModalOpen}
            onClose={() => {
              setIsExportModalOpen(false);
            }}
          />
        )}
        {isPostmanExportModalOpen && (
          <PostmanEnvironmentExportModal
            environments={[{ id: environmentId, name: environmentName, variables: convertEnvironmentToMap(variables) }]}
            isOpen={isPostmanExportModalOpen}
            onClose={() => {
              setIsPostmanExportModalOpen(false);
            }}
          />
        )} */}
      </div>
    </div>
  );
};
