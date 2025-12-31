import type React from "react";
import { useCallback, useMemo, useState } from "react";
import "./environmentView.scss";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import type {
  BufferedEnvironmentEntity,
  BufferedGlobalEnvironmentEntity,
} from "features/apiClient/slices/entities/buffered/environment";
import { EntityNotFound, entitySynced, useApiClientRepository } from "features/apiClient/slices";
import { EnvironmentVariablesList } from "../VariablesList/EnvironmentVariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { bufferActions, bufferAdapterSelectors } from "features/apiClient/slices/buffer/slice";
import { isEmpty } from "lodash";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { PostmanEnvironmentExportModal } from "features/apiClient/screens/apiClient/components/modals/postmanEnvironmentExportModal/PostmanEnvironmentExportModal";

interface EnvironmentViewProps {
  entity: BufferedEnvironmentEntity | BufferedGlobalEnvironmentEntity;
  environmentId: string;
  isGlobal: boolean;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ entity, environmentId, isGlobal }) => {
  const dispatch = useApiClientDispatch();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

  const repositories = useApiClientRepository();
  const state = useApiClientSelector((s) => s);
  const isNewEnvironment = useApiClientSelector((s) => s.buffer.entities[entity.id]?.isNew);

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const environmentName = entity.getName(state);
  const variables = entity.variables;
  const variablesData = useMemo(() => variables.getAll(state), [variables, state]);

  // key prop should be id
  const bufferEntry = useApiClientSelector((s) => bufferAdapterSelectors.selectById(s.buffer, entity.meta.id));
  const hasUnsavedChanges = useMemo(() => bufferEntry?.isDirty ?? false, [bufferEntry]);

  const handleSaveVariables = useCallback(async () => {
    try {
      if (!bufferEntry) throw new EntityNotFound(entity.meta.id, "buffer");
      setIsSaving(true);
      const dataToSave = variables.getAll(state);
      await repositories.environmentVariablesRepository.updateEnvironment(environmentId, { variables: dataToSave });
      dispatch(
        entitySynced({
          entityType: bufferEntry.entityType,
          entityId: environmentId,
          data: { variables: dataToSave },
        })
      );
      dispatch(
        bufferActions.markSaved({
          id: entity.meta.id,
          referenceId: environmentId,
          savedData: { variables: dataToSave },
        })
      );
    } catch (error) {
      console.error("Failed to update variables", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    bufferEntry,
    entity.meta.id,
    variables,
    state,
    repositories.environmentVariablesRepository,
    environmentId,
    dispatch,
  ]);

  return (
    <div key={environmentId} className="variables-list-view-container">
      <div className="variables-list-view">
        <VariablesListHeader
          isNewEnvironment={isNewEnvironment || false}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          currentEnvironmentName={environmentName}
          environmentId={environmentId}
          onSave={handleSaveVariables}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          exportActions={{
            showExport: isGlobal,
            enableExport: !isEmpty(variablesData),
            onRequestlyExportClick: () => setIsExportModalOpen(true),
            onPostmanExportClick: () => setIsPostmanExportModalOpen(true),
          }}
        />
        <EnvironmentVariablesList
          variablesData={variablesData}
          variables={variables}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
        />
        {isExportModalOpen && (
          <ApiClientExportModal
            exportType="environment"
            environments={[{ id: environmentId, name: environmentName, variables: variablesData }]}
            isOpen={isExportModalOpen}
            onClose={() => {
              setIsExportModalOpen(false);
            }}
          />
        )}
        {isPostmanExportModalOpen && (
          <PostmanEnvironmentExportModal
            environments={[{ id: environmentId, name: environmentName, variables: variablesData }]}
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
