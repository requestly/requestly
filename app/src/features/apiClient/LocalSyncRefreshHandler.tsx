import React, { useCallback, useEffect } from "react";
import { toast } from "utils/Toast";
import { refreshAllContexts } from "./commands/context/refreshAllContexts.command";

export const LocalSyncRefreshHandler: React.FC = () => {
  const handleRefresh = useCallback(async () => {
    const result = await refreshAllContexts();
    const message = (() => {
      if (result.every((r) => r.status === "fulfilled")) {
        return {
          type: "success",
          message: "Refreshed Successfully!",
        } as const;
      }
      if (result.length === 1) {
        return {
          type: "error",
          message: "Could not refresh!",
        } as const;
      }

      return {
        type: "warn",
        message: "Some workspaces could not be refreshed!",
      } as const;
    })();
    switch (message.type) {
      case "success":
        return toast.success(message.message);
      case "error":
        return toast.error(message.message);
      case "warn":
        return toast.warn(message.message);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("local-sync-refresh", handleRefresh);
    return () => {
      window.removeEventListener("local-sync-refresh", handleRefresh);
    };
  }, [handleRefresh]);

  return null;
};
