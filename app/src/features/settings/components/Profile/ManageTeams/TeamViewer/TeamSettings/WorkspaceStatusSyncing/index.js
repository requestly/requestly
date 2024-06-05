import React, { useState } from "react";
import { toast } from "utils/Toast";
import { doSyncThrottled } from "hooks/DbListenerInit/syncingNodeListener";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { get } from "firebase/database";
import { getNodeRef } from "actions/FirebaseActions";
import { getRecordsSyncPath, getSyncRuleStatus } from "utils/syncing/syncDataUtils";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import SettingsItem from "features/settings/components/GlobalSettings/components/SettingsItem";
import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import { decompressRecords } from "utils/Compression";
import FEATURES from "config/constants/sub/features";
import { useFeatureValue } from "@growthbook/growthbook-react";

const WorkspaceStatusSyncing = () => {
  const dispatch = useDispatch();
  // Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  // Component State
  const [syncRuleStatus, setSyncRuleStatus] = useState(getSyncRuleStatus());
  const isWorkspaceSyncOverriden = useFeatureValue(FEATURES.OVERRIDE_TEAM_SYNC_STATUS, false);
  const overridenSyncValue = useFeatureValue(FEATURES.OVERRIDEN_SYNC_STATUS_VALUE, true);

  const handleToggleStatusSyncing = async () => {
    if (isWorkspaceSyncOverriden) {
      toast.info("This setting is enforced organisation wide\n Please contact support to change this.");
      // not reconfiguring local state so as to preserve user's original choice before override
      return;
    }
    const triggerSync = async () => {
      const syncNodeRef = getNodeRef(
        getRecordsSyncPath("teamSync", user.details.profile.uid, currentlyActiveWorkspace.id)
      );

      const syncNodeRefNode = await get(syncNodeRef);

      doSyncThrottled(
        user.details.profile.uid,
        appMode,
        dispatch,
        decompressRecords(syncNodeRefNode.val()),
        "teamSync",
        user.details.profile.uid
      );
    };

    if (syncRuleStatus) {
      localStorage.setItem("syncRuleStatus", "false");
      setSyncRuleStatus(false);
      toast.success("Status syncing turned off");
      trackSettingsToggled("workspace_status_syncing", false);
    } else {
      localStorage.setItem("syncRuleStatus", "true");
      setSyncRuleStatus(true);
      toast.success("Status syncing turned on");
      trackSettingsToggled("workspace_status_syncing", true);
      triggerSync();
    }
  };

  return (
    <SettingsItem
      isActive={isWorkspaceSyncOverriden ? overridenSyncValue : syncRuleStatus}
      onChange={handleToggleStatusSyncing}
      title="Enable status syncing in team workspaces"
      caption="Stay updated by automatically syncing rule modifications with your teammates."
      isChangeAble={isWorkspaceSyncOverriden ? false : true}
    />
  );
};

export default WorkspaceStatusSyncing;
