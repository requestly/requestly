import React, { useCallback, useEffect } from "react";
import { toast } from "utils/Toast";
import { refreshAllContexts } from "./commands/context/refreshAllContexts.command";

export const LocalSyncRefreshHandler: React.FC = () => {
  const handleRefresh = useCallback(async () => {
    await refreshAllContexts();
    // TODO: PARSE THE RESULT AND GIVE THE MESSAGE CORRECTLY
    toast.success("Workspace refreshed successfully!");
  }, []);

  useEffect(() => {
    window.addEventListener("local-sync-refresh", handleRefresh);
    return () => {
      window.removeEventListener("local-sync-refresh", handleRefresh);
    };
  }, [handleRefresh]);

  return null;
};
