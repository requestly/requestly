import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { checkIsProxyApplied } from "actions/ExtensionActions";
import PSMH from "../config/PageScriptMessageHandler";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";

export const useDesktopAppConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return;

    checkIsProxyApplied()
      .then((isConnected) => {
        setIsConnected(isConnected);
      })
      .catch((error) => {
        Logger.error("Error checking is proxy applied", error);
      });

    const messageListener = (message: { action: string; payload: boolean; source: string }) => {
      setIsConnected(message.payload);
    };

    PSMH.addMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED, messageListener);

    return () => {
      PSMH.removeMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED);
    };
  }, [appMode]);

  return {
    isDesktopAppConnected: isConnected,
  };
};
