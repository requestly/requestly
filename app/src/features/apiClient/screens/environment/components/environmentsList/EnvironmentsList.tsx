import { useCallback, useState, useMemo } from "react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentsListItem } from "./components/environmentsListItem/EnvironmentsListItem";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { SidebarPlaceholderItem } from "features/apiClient/screens/apiClient/components/sidebar/components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { EnvironmentData } from "backend/environment/types";
import { useRBAC } from "features/rbac";
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const { getAllEnvironments, getEnvironmentVariables } = useEnvironmentManager();
  const [searchValue, setSearchValue] = useState("");
  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { isRecordBeingCreated } = useApiClientContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");

  const environments = useMemo(() => getAllEnvironments(), [getAllEnvironments]);
  const filteredEnvironments = useMemo(
    () =>
      environments
        .filter((environment) => environment.name?.toLowerCase().includes(searchValue?.toLowerCase()))
        .sort((a, b) => {
          if (isGlobalEnvironment(a.id)) return -1;
          if (isGlobalEnvironment(b.id)) return 1;
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }),
    [environments, searchValue]
  );

  const handleExportEnvironments = useCallback(
    (environment: { id: string; name: string }) => {
      const variables = getEnvironmentVariables(environment.id);
      setEnvironmentsToExport([{ ...environment, variables }]);

      setIsExportModalOpen(true);
    },
    [getEnvironmentVariables]
  );

  return (
    <div style={{ height: "inherit" }}>
      <SidebarListHeader
        onSearch={(value) => setSearchValue(value)}
        newRecordActionOptions={{
          showNewRecordAction: false,
          onNewRecordClick: () => Promise.resolve(),
        }}
      />
      <div className="environments-list-container">
        <div className="environments-list">
          {searchValue.length > 0 && filteredEnvironments.length === 0 ? (
            <ListEmptySearchView message="No environments found. Try searching with a different name" />
          ) : (
            <>
              {filteredEnvironments.map((environment) =>
                isGlobalEnvironment(environment.id) ? (
                  <EnvironmentsListItem environment={environment} isReadOnly={!isValidPermission} />
                ) : (
                  <EnvironmentsListItem
                    environment={environment}
                    isReadOnly={!isValidPermission}
                    onExportClick={handleExportEnvironments}
                  />
                )
              )}
              <div className="mt-8">
                {isRecordBeingCreated === RQAPI.RecordType.ENVIRONMENT && (
                  <SidebarPlaceholderItem name="New Environment" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {isExportModalOpen && (
        <ApiClientExportModal
          exportType="environment"
          environments={environmentsToExport}
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
