import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { checkIsProxyApplied } from "actions/ExtensionActions";
import PSMH from "../config/PageScriptMessageHandler";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import Logger from "lib/logger";

import PATHS from "config/constants/sub/paths";

const EXCLUDED_PATHS = [
  PATHS.AUTH.SIGN_IN.RELATIVE,
  PATHS.AUTH.SIGN_UP.RELATIVE,
  PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE,
  "/invite",
  PATHS.AUTH.EMAIL_ACTION.RELATIVE,
  PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE,
  PATHS.SESSIONS.SAVED.RELATIVE,
  PATHS.PRICING.RELATIVE,
  PATHS.AUTH.START.RELATIVE,
  PATHS.AUTH.LOGIN.RELATIVE,
];

export const getShouldShowDesktopConnected = (currentPath: string) => {
  return !EXCLUDED_PATHS.some((path) => currentPath.includes(path));
};

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
