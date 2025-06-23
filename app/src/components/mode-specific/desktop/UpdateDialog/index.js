import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import * as semver from "semver";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { getAppMode } from "store/selectors";
import NonBlockingDialog from "./NonBlockingDialog";
import { isEqual } from "lodash";
import { getUserOS } from "utils/osUtils";
import { getLinkWithMetadata } from "modules/analytics/metadata";
import MandatoryUpdateScreen from "./MandatoryUpdateScreen";

/* CURRENTLY ONLY FOR MACOS */
const UpdateDialog = () => {
  const appMode = useSelector(getAppMode);

  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [, setUpdateProgress] = useState(null);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);
  const updateDetailsRef = useRef({});

  useEffect(() => {
    if (window.RQ && window.RQ && window.RQ.DESKTOP) {
      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("update-downloaded", (payload) => {
        if (payload && !isEqual(payload, updateDetailsRef.current)) {
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
  const redirectToDownloadPage = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: getLinkWithMetadata("https://requestly.com/desktop"),
    });
  };

  const isIncompatible = () => {
    // users is being forced to update because this version would become breaking soon
    if (getUserOS() !== "macOS") return true;
    const desktop_app_version = window?.RQ?.DESKTOP?.VERSION;

    if (desktop_app_version && APP_CONSTANTS.DESKTOP_APP_MIN_COMPATIBLE_VERSION) {
      if (semver.lt(desktop_app_version, APP_CONSTANTS.DESKTOP_APP_MIN_COMPATIBLE_VERSION)) {
        return true;
      }
    }
    return false;
  };

  const isBreaking = () => {
    // users needs to update manually
    if (getUserOS() !== "macOS") return false;

    const desktop_app_version = window?.RQ?.DESKTOP?.VERSION;
    if (desktop_app_version && APP_CONSTANTS.DESKTOP_APP_MIN_NON_BREAKING_VERSION) {
      if (semver.lt(desktop_app_version, APP_CONSTANTS.DESKTOP_APP_MIN_NON_BREAKING_VERSION)) {
        console.log("DG: breaking");
        return true;
      }
    }
    console.log("DG: not breaking");
    return false;
  };

  if (
    appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ||
    getUserOS() !== "macOS" || // todo: handle once windows release is ready
    !isUpdateAvailable
  )
    return null;

  return isBreaking() ? (
    <MandatoryUpdateScreen handleCTAClick={redirectToDownloadPage} CTAText="Download Now" />
  ) : isUpdateDownloaded ? (
    isIncompatible() ? (
      <MandatoryUpdateScreen handleCTAClick={quitAndInstall} CTAText="Install Now" />
    ) : (
      <NonBlockingDialog updateDetails={updateDetailsRef.current} quitAndInstall={quitAndInstall} />
    )
  ) : null;
};

export default UpdateDialog;
