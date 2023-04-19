import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import * as semver from "semver";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { getAppMode } from "store/selectors";
import BlockingDialog from "./BlockingDialog";
import NonBlockingDialog from "./NonBlockingDialog";
import _ from "lodash";
import BreakingDialog from "./BreakingDialog";
import { getUserOS } from "utils/Misc";

const UpdateDialog = () => {
  const appMode = useSelector(getAppMode);

  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(null);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);
  const updateDetailsRef = useRef({});

  useEffect(() => {
    if (window.RQ && window.RQ && window.RQ.DESKTOP) {
      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("update-downloaded", (payload) => {
        if (payload && !_.isEqual(payload, updateDetailsRef.current)) {
          setIsUpdateDownloaded(true);
          updateDetailsRef.current = payload;
        }
      });

      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("download-progress", (payload) => {
        console.log(payload);
        // {total: 115783355, delta: 155698, transferred: 155698, percent: 0.13447356055626478, bytesPerSecond: 146746}
        setUpdateProgress(payload);
      });

      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("update-available", (payload) => {
        console.log(payload);
        setIsUpdateAvailable(true);
        updateDetailsRef.current = payload;
      });

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("check-for-updates-and-notify", {});
    }
  }, []);

  const quitAndInstall = () => {
    console.log("quit and install");
    if (window.RQ && window.RQ && window.RQ.DESKTOP && isUpdateDownloaded) {
      console.log("invoking install in main");
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("quit-and-install", {});
    }
  };

  const isUICompatible = () => {
    const desktop_app_version = window?.RQ?.DESKTOP?.VERSION;

    if (desktop_app_version && APP_CONSTANTS.DESKTOP_APP_MIN_COMPATIBLE_VERSION) {
      if (semver.lt(desktop_app_version, APP_CONSTANTS.DESKTOP_APP_MIN_COMPATIBLE_VERSION)) {
        return false;
      }
    }
    return true;
  };

  const isBreaking = () => {
    if (getUserOS() === "macOS") {
      const desktop_app_version = window?.RQ?.DESKTOP?.VERSION;
      if (desktop_app_version && APP_CONSTANTS.DESKTOP_APP_MIN_NON_BREAKING_VERSION) {
        if (semver.lt(desktop_app_version, APP_CONSTANTS.DESKTOP_APP_MIN_NON_BREAKING_VERSION)) {
          return true;
        }
      }
    }
    return false;
  };

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    if (isBreaking()) {
      return <BreakingDialog />;
    } else if (!isUICompatible()) {
      return (
        <BlockingDialog
          quitAndInstall={quitAndInstall}
          updateDetails={updateDetailsRef.current}
          isUpdateAvailable={isUpdateAvailable}
          isUpdateDownloaded={isUpdateDownloaded}
          updateProgress={updateProgress}
        />
      );
    } else if (isUpdateDownloaded) {
      return <NonBlockingDialog updateDetails={updateDetailsRef.current} quitAndInstall={quitAndInstall} />;
    }
  }
  return null;
};

export default UpdateDialog;
