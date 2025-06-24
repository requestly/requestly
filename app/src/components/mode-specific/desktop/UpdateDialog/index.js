import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getAppMode } from "store/selectors";
import NonBlockingDialog from "./NonBlockingDialog";
import { isEqual } from "lodash";
import { getLinkWithMetadata } from "modules/analytics/metadata";
import MandatoryUpdateScreen from "./MandatoryUpdateScreen";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

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

  const isIncompatible = () => !isFeatureCompatible(FEATURES.COMPATIBLE_DESKTOP_APP);
  const isBreaking = () => !isFeatureCompatible(FEATURES.NON_BREAKING_DESKTOP_APP);

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP || !isUpdateAvailable) return null;

  if (isBreaking()) return <MandatoryUpdateScreen handleCTAClick={redirectToDownloadPage} CTAText="Download Now" />;
  if (!isUpdateDownloaded) return null;
  if (isIncompatible()) return <MandatoryUpdateScreen handleCTAClick={quitAndInstall} CTAText="Install Now" />;
  return <NonBlockingDialog updateDetails={updateDetailsRef.current} quitAndInstall={quitAndInstall} />;
};

export default UpdateDialog;
