import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import ErrorCard from "components/misc/ErrorCard";
import SettingsItem from "../../SettingsItem";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { StorageService } from "init";
import { toast } from "utils/Toast";
import { trackConsoleLoggerToggled } from "modules/analytics/events/features/consoleLogger";
import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import Logger from "lib/logger";

const ConsoleLogger = ({ isCompatible }) => {
  const appMode = useSelector(getAppMode);
  const [consoleLoggerStatus, setConsoleLoggerStatus] = useState(false);

  useEffect(() => {
    Logger.log("Reading storage in ConsoleLogger");
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.CONSOLE_LOGGER_ENABLED)
      .then((status) => setConsoleLoggerStatus(status));
  }, [appMode, setConsoleLoggerStatus]);

  const handleConsoleLoggerStatus = (status) => {
    setConsoleLoggerStatus(status);
    trackConsoleLoggerToggled(window.uid, status);
    Logger.log("Writing storage in saveConsoleLoggerState");
    StorageService(appMode).saveConsoleLoggerState(status);
    toast.success(`Console logging ${status ? "enabled" : "disabled"}`);
    trackSettingsToggled("console_logger", status);
  };

  return isCompatible ? (
    <SettingsItem
      isActive={consoleLoggerStatus}
      onChange={handleConsoleLoggerStatus}
      title="Enable console logs"
      caption="You may enable logging to log rules applied by Requestly on the page in your developer console."
    />
  ) : (
    <ErrorCard type="warning" customErrorMessage="Please upgrade the extension to enable console logger." />
  );
};

export default ConsoleLogger;
