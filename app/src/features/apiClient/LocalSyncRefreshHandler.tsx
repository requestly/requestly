import React, { useCallback, useEffect } from "react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { useApiClientContext } from "./contexts";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { toast } from "utils/Toast";

export const LocalSyncRefreshHandler: React.FC = () => {
  const { forceRefreshApiClientRecords, apiClientRecordsRepository } = useApiClientContext();
  const { forceRefreshEnvironments } = useEnvironmentManager();

  const handleRefresh = useCallback(async () => {
    await reloadFsManager(apiClientRecordsRepository.meta.rootPath);
    await Promise.all([forceRefreshApiClientRecords(), forceRefreshEnvironments()]);
    toast.success("Workspace refreshed successfully!");
  }, [forceRefreshApiClientRecords, forceRefreshEnvironments, apiClientRecordsRepository]);

  useEffect(() => {
    window.addEventListener("local-sync-refresh", handleRefresh);
    return () => {
      window.removeEventListener("local-sync-refresh", handleRefresh);
    };
  }, [handleRefresh]);

  return null;
};
