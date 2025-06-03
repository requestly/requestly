import { useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQButton } from "lib/design-system-v2/components";
import { useCallback } from "react";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { toast } from "utils/Toast";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import "./localSyncRefreshButton.scss";
import { WorkspaceType } from "types";

export const LocalSyncRefreshButton = () => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isLocalWorkspace = activeWorkspace?.workspaceType === WorkspaceType.LOCAL;

  const { forceRefreshApiClientRecords, apiClientRecordsRepository } = useApiClientContext();
  const { forceRefreshEnvironments } = useEnvironmentManager();

  const handleRefresh = useCallback(() => {
    reloadFsManager(apiClientRecordsRepository.meta.rootPath).then(() => {
      Promise.all([forceRefreshApiClientRecords(), forceRefreshEnvironments()])
        .then(() => {
          toast.success("Workspace refreshed successfully!");
        })
        .catch((error) => {
          throw error;
        });
    });
  }, [forceRefreshApiClientRecords, forceRefreshEnvironments, apiClientRecordsRepository]);

  if (!isLocalWorkspace) return null;

  return (
    <RQButton
      className="local-sync-refresh-button"
      type="transparent"
      size="small"
      icon={<MdOutlineRefresh />}
      onClick={handleRefresh}
    >
      Refresh
    </RQButton>
  );
};
