import type React from "react";
import { useCallback, useState } from "react";
import "./environmentView.scss";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import type {
  BufferedEnvironmentEntity,
  BufferedGlobalEnvironmentEntity,
} from "features/apiClient/slices/entities/buffered/environment";
import { EntityNotFound, entitySynced, useApiClientRepository } from "features/apiClient/slices";
import { EnvironmentVariablesList } from "../VariablesList/EnvironmentVariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { isEmpty } from "lodash";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { PostmanEnvironmentExportModal } from "features/apiClient/screens/apiClient/components/modals/postmanEnvironmentExportModal/PostmanEnvironmentExportModal";
import { ApiClientRootState } from "features/apiClient/slices/hooks/types";
import { useBufferByBufferId, useIsBufferDirty } from "features/apiClient/slices/entities";

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
  const isNewEnvironment = useApiClientSelector(s => s.buffer.entities[entity.id]?.isNew);

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const environmentName = useApiClientSelector((s: ApiClientRootState) => entity.getName(s));
  const variables = entity.variables;
  const variablesData = useApiClientSelector((state: ApiClientRootState) => variables.getAll(state));

  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: environmentId,
    type: "referenceId",
  });
  
  const bufferEntry = useBufferByBufferId(entity.meta.id);

  const handleSaveVariables = useCallback(async () => {
    try {
      if (!bufferEntry) throw new EntityNotFound(entity.meta.id, "buffer");
      setIsSaving(true);
      const dataToSave = variablesData;
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
  }, [repositories,bufferEntry, variablesData, environmentId, dispatch, entity.meta.id]);

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
