import React, { useCallback, useEffect } from "react";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { toast } from "utils/Toast";
import { useApiClientRepository } from "./helpers/modules/sync/useApiClientSyncRepo";
import { useCommand } from "./commands";

export const LocalSyncRefreshHandler: React.FC = () => {
  const { apiClientRecordsRepository } = useApiClientRepository();
  const {
    env: { forceRefreshEnvironments },
    api: { forceRefreshRecords },
  } = useCommand();

  const handleRefresh = useCallback(async () => {
    await reloadFsManager(apiClientRecordsRepository.meta.rootPath);
    await Promise.all([forceRefreshRecords(), forceRefreshEnvironments()]);
    toast.success("Workspace refreshed successfully!");
  }, [forceRefreshRecords, forceRefreshEnvironments, apiClientRecordsRepository]);

  useEffect(() => {
    window.addEventListener("local-sync-refresh", handleRefresh);
    return () => {
      window.removeEventListener("local-sync-refresh", handleRefresh);
    };
  }, [handleRefresh]);

  return null;
};
