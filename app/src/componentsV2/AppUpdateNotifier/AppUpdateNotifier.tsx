import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import firebaseApp from "firebase";
import * as semver from "semver";
import { TbRefreshDot } from "@react-icons/all-files/tb/TbRefreshDot";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RQButton } from "lib/design-system-v2/components";
import "./appUpdateNotifier.scss";
import {
  trackAppUpdateForceReload,
  trackAppUpdateNotificationClicked,
  trackAppUpdateNotificationViewed,
} from "./analytics";
import * as Sentry from "@sentry/react";
import { useSearchParams } from "react-router-dom";

type AppVersions = {
  latestAppVersion: string;
  breakingAppVersion: string;
};

const FORCE_REFRESH_PARAM = "forceRefresh";

export const AppUpdateNotifier: React.FC = () => {
  const [showRefreshOption, setShowRefreshOption] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isForceRefresh = searchParams.get(FORCE_REFRESH_PARAM) === "true";

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

          // const currentAppVersion = process.env.REACT_APP_VERSION;
          const currentAppVersion = "20.5.16-12.26";

          if (!semver.valid(currentAppVersion)) {
            Sentry.captureException(new Error("Invalid current app version format"), { extra: { currentAppVersion } });
            return;
          }

          const appVersions: AppVersions = snapshot.val();
          let latestAppVersion = appVersions.latestAppVersion;
          let breakingAppVersion = appVersions.breakingAppVersion;
          const FALLBACK_VERSION = "0.0.0";

          if (!semver.valid(latestAppVersion)) {
            Sentry.captureMessage("Invalid latest app version format", {
              extra: { latestAppVersion },
            });

            latestAppVersion = FALLBACK_VERSION;
          }

          if (!semver.valid(breakingAppVersion)) {
            Sentry.captureMessage("Invalid breaking app version format", {
              extra: { breakingAppVersion },
            });

            breakingAppVersion = FALLBACK_VERSION;
          }

          // We forgot to update the latestAppVersion in DB
          // if (semver.gt(currentAppVersion, latestAppVersion)) {
          //   Sentry.captureMessage("[App update notifier] Current version is greater than latest version", {
          //     extra: {
          //       currentAppVersion,
          //       latestAppVersion,
          //       breakingAppVersion,
          //     },
          //   });
          //   return;
          // }

          if (semver.lt(currentAppVersion, breakingAppVersion) && !isForceRefresh) {
            trackAppUpdateForceReload(currentAppVersion, breakingAppVersion);

            setSearchParams((params) => {
              params.set(FORCE_REFRESH_PARAM, "true");
              return params;
            });

            window.location.replace(window.location.href);
          } else if (semver.lt(currentAppVersion, latestAppVersion)) {
            trackAppUpdateNotificationViewed("app_update");
            setShowRefreshOption(true);
          } else {
            return;
          }
        } catch (e) {
          Sentry.captureException(e);
        }
      },
      (e) => {
        Sentry.captureException(e);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isForceRefresh, setSearchParams]);

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
