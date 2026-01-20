import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { getAppMode } from "store/selectors";
import NonBlockingDialog from "./NonBlockingDialog";
import { isEqual } from "lodash";
import { getLinkWithMetadata } from "modules/analytics/metadata";
import MandatoryUpdateScreen from "./MandatoryUpdateScreen";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import {
  trackTriggeredRedirectedToManuallyInstall,
  trackTriggerManualClickAndInstall,
  trackUpdateAvailable,
  trackUpdateDownloadComplete,
} from "modules/analytics/events/desktopApp";

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
          trackUpdateDownloadComplete();
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
        trackUpdateAvailable();
      });

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("check-for-updates-and-notify", {});
    }
  }, []);

  const quitAndInstall = () => {
    console.log("quit and install");
    if (window.RQ && window.RQ && window.RQ.DESKTOP && isUpdateDownloaded) {
      trackTriggerManualClickAndInstall();
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("quit-and-install", {});
    }
  };
  const redirectToDownloadPage = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: getLinkWithMetadata("https://requestly.com/desktop"),
    });
    trackTriggeredRedirectedToManuallyInstall();
  };

  const isIncompatible = () => !isFeatureCompatible(FEATURES.COMPATIBLE_DESKTOP_APP);
  const isBreaking = () => !isFeatureCompatible(FEATURES.NON_BREAKING_DESKTOP_APP);

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP || !isUpdateAvailable) return null;

  if (isBreaking()) return <MandatoryUpdateScreen handleCTAClick={redirectToDownloadPage} />;

  if (!isUpdateDownloaded) return null;

  if (isIncompatible()) {
    return (
      <MandatoryUpdateScreen
        handleCTAClick={quitAndInstall}
        title="Update required: This version is no longer supported"
        description="You're using an outdated version of Requestly that is no longer functional. To continue using the app, please quit and restart the app."
        ctaText="Restart App"
      />
    );
  }
  return <NonBlockingDialog updateDetails={updateDetailsRef.current} quitAndInstall={quitAndInstall} />;
};

export default UpdateDialog;
