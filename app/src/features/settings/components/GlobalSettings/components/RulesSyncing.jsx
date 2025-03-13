import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { setSyncState } from "utils/syncing/SyncUtils";
import { toast } from "utils/Toast";
import { SOURCE } from "modules/analytics/events/common/constants";
import SettingsItem from "./SettingsItem";
import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";

const RulesSyncing = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("global_settings", "update");
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const [isSyncStatusChangeProcessing, setIsSyncStatusChangeProcessing] = useState(false);
  const isWorkspaceMode = !!activeWorkspaceId;
  const isUserLoggedIn = !!(user?.loggedIn || user?.details || user?.details?.profile);

  const handleRulesSyncToggle = (status) => {
    if (!user.loggedIn || !user.details || !user.details.profile) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            eventSource: SOURCE.ENABLE_SYNC,
          },
        })
      );
      return;
    }

    setIsSyncStatusChangeProcessing(true);
    setSyncState(user.details.profile.uid, status, appMode)
      .then(() => {
        toast.info(`We ${status ? "will" : "won't"} be syncing your rules automatically hereon.`);
      })
      .catch(() => {
        toast.error(`Sorry, we are experiencing issues updating the sync state.`);
      })
      .finally(() => setIsSyncStatusChangeProcessing(false));

    trackSettingsToggled("rules_syncing", status);
  };

  return (
    <SettingsItem
      isActive={isUserLoggedIn && (isWorkspaceMode || (user?.details?.isSyncEnabled ?? false))}
      onChange={handleRulesSyncToggle}
      disabled={isWorkspaceMode || !isValidPermission}
      loading={isSyncStatusChangeProcessing}
      title="Enable syncing"
      toolTipTitle={isWorkspaceMode ? "Syncing is on" : ""}
      caption="Always keep your rules in sync irrespective of the device you use."
    />
  );
};

export default RulesSyncing;
