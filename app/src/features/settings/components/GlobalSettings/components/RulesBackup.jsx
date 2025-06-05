import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { createBackupIfRequired, setIsBackupEnabled } from "utils/BackupUtils";
import SettingsItem from "./SettingsItem";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackBackupToggled } from "modules/analytics/events/features/syncing/backup";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

const RulesBackup = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [backupStatus, setBackupStatus] = useState(user?.details?.isBackupEnabled ?? false);
  const [isBackupStatusChangeProcessing, setIsBackupStatusChangeProcessing] = useState(false);

  useEffect(() => {
    if (user?.loggedIn && user?.details?.isBackupEnabled) {
      createBackupIfRequired(appMode);
    }
  }, [appMode, user]);

  const handleBackupEnabled = (status) => {
    if (!user.loggedIn || !user.details || !user.details.profile) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            eventSource: SOURCE.ENABLE_BACKUP,
          },
        })
      );
      return;
    }

    setBackupStatus(status);
    setIsBackupStatusChangeProcessing(true);
    setIsBackupEnabled(user.details.profile.uid, status)
      .then(() => trackBackupToggled(status))
      .finally(() => setIsBackupStatusChangeProcessing(false));

    trackBackupToggled(status);
  };

  if (activeWorkspaceId) return;

  // TODO: add existing backup link
  return (
    <SettingsItem
      isActive={backupStatus}
      onChange={handleBackupEnabled}
      loading={isBackupStatusChangeProcessing}
      title="Enable backups"
      caption="Securely backup your rules to Requestly servers so that you don't lose them while switching devices."
    />
  );
};

export default RulesBackup;
