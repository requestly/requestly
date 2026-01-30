import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { PostmanEnvironmentExportModal } from "features/apiClient/screens/apiClient/components/modals/postmanEnvironmentExportModal/PostmanEnvironmentExportModal";
import { useSaveBuffer } from "features/apiClient/slices/buffer/hooks";
import { useIsBufferDirty } from "features/apiClient/slices/entities";
import type {
  BufferedEnvironmentEntity,
  BufferedGlobalEnvironmentEntity,
} from "features/apiClient/slices/entities/buffered/environment";
import { OriginExists } from "features/apiClient/slices/entities/buffered/factory";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { ApiClientRootState } from "features/apiClient/slices/hooks/types";
import { isEmpty } from "lodash";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { EnvironmentVariablesList } from "../VariablesList/EnvironmentVariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import "./environmentView.scss";
import { ApiClientStoreState } from "features/apiClient/slices";

interface EnvironmentViewProps {
  entity: OriginExists<BufferedEnvironmentEntity | BufferedGlobalEnvironmentEntity>;
  environmentId: string;
  isGlobal: boolean;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ entity, environmentId, isGlobal }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

  const isNewEnvironment = useApiClientSelector((s) => s.buffer.entities[entity.id]?.isNew);

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const environmentName = useApiClientSelector((s: ApiClientStoreState) => entity.getName(s));
  const variables = entity.variables;
  const variablesData = useApiClientSelector((state: ApiClientRootState) => variables.getAll(state));

  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: environmentId,
    type: "referenceId",
  });

  const saveBuffer = useSaveBuffer();
  const handleSaveVariables = useCallback(async () => {
    saveBuffer(
      {
        entity: entity,
        async save(changes, repositories) {
          const { name: _ignoredName, ...changesWithoutName } = changes as typeof changes & {
            name?: unknown;
          };
          await repositories.environmentVariablesRepository.updateEnvironment(environmentId, changesWithoutName);
        },
      },
      {
        beforeSave() {
          setIsSaving(true);
        },
        afterSave() {
          setIsSaving(false);
        },
        onError(error) {
          console.error("Failed to update variables", error);
        },
        onSuccess() {
          toast.success("Variables updated successfully");
        },
      }
    );
  }, [saveBuffer, entity, environmentId]);

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
