import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import firebaseApp from "firebase";
import * as semver from "semver";
import { captureException } from "backend/apiClient/utils";
import { TbRefreshDot } from "@react-icons/all-files/tb/TbRefreshDot";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RQButton } from "lib/design-system-v2/components";
import "./appUpdateNotifier.scss";
import {
  trackAppUpdateForceReload,
  trackAppUpdateNotificationClicked,
  trackAppUpdateNotificationViewed,
} from "./analytics";

type AppVersions = {
  latestAppVersion: string;
  breakingAppVersion: string;
};

export const AppUpdateNotifier: React.FC = () => {
  const [showRefreshOption, setShowRefreshOption] = useState(false);

  useEffect(() => {
    const database = getDatabase(firebaseApp);
    const appDataRef = ref(database, "_appData");

    const unsubscribe = onValue(
      appDataRef,
      (snapshot) => {
        try {
          if (!snapshot.exists()) {
            throw new Error("App data does not exist");
          }

          const currentAppVersion = process.env.REACT_APP_VERSION;

          const appVersions: AppVersions = snapshot.val();
          const latestAppVersion = appVersions.latestAppVersion;
          const breakingAppVersion = appVersions.breakingAppVersion;

          if (semver.valid(latestAppVersion) === null || semver.valid(breakingAppVersion) === null) {
            throw new Error("Invalid app version format");
          }

          // v1 === v2: NOOP
          if (semver.eq(currentAppVersion, latestAppVersion)) {
            return;
          }

          // v1 > v2: minor version, show refresh option
          if (semver.gt(currentAppVersion, breakingAppVersion)) {
            trackAppUpdateNotificationViewed("app_update");
            setShowRefreshOption(true);
            return;
          }

          // v1 <= v2: force refresh
          if (semver.lte(currentAppVersion, breakingAppVersion)) {
            trackAppUpdateForceReload(currentAppVersion, breakingAppVersion);
            window.location.replace(window.location.href);
            return;
          }
        } catch (e) {
          captureException(e);
        }
      },
      (e) => {
        captureException(e);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleClose = () => {
    trackAppUpdateNotificationClicked("app_update", "close");
    setShowRefreshOption(false);
  };

  const handleRefresh = () => {
    trackAppUpdateNotificationClicked("app_update", "app_refresh");
    window.location.replace(window.location.href);
  };

  return showRefreshOption ? (
    <div className="app-update-notifier-container">
      <div className="content">
        <TbRefreshDot className="icon" />
        <div className="title-container">
          <div className="title">New update available</div>
          <div className="description">Refresh to apply the latest updates.</div>
          <RQButton size="small" className="close-btn" icon={<MdClose />} type="transparent" onClick={handleClose} />
        </div>
      </div>
      <RQButton className="refresh-btn" block onClick={handleRefresh}>
        Refresh now
      </RQButton>
    </div>
  ) : null;
};
