import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { setSyncState } from "utils/syncing/SyncUtils";
import { toast } from "utils/Toast";
import { AUTH } from "modules/analytics/events/common/constants";
import SettingsItem from "../../SettingsItem";

const RulesSyncing = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const [syncStatus, setSyncStatus] = useState();
  const [
    isSyncStatusChangeProcessing,
    setIsSyncStatusChangeProcessing,
  ] = useState(false);

  const handleSyncEnabled = (status) => {
    if (!user.loggedIn || !user.details || !user.details.profile) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            eventSource: AUTH.SOURCE.ENABLE_SYNC,
          },
        })
      );
      return;
    }

    setSyncStatus(status);
    setIsSyncStatusChangeProcessing(true);
    setSyncState(user.details.profile.uid, status)
      .then(() => {
        toast.info(
          `We ${
            status ? "will" : "won't"
          } be syncing your rules automatically hereon.`
        );
      })
      .catch(() => {
        toast.error(
          `Sorry, we are experiencing issues updating the sync state.`
        );
      })
      .finally(() => setIsSyncStatusChangeProcessing(false));
  };

  return (
    <SettingsItem
      isActive={syncStatus}
      onClick={handleSyncEnabled}
      isProcessing={isSyncStatusChangeProcessing}
      title="Enable syncing"
      caption="Always keep your rules in sync irrespective of the device you use."
    />
  );
};

export default RulesSyncing;
