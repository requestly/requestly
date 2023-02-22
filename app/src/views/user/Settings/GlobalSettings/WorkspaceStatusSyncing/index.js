import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import React, { useState } from "react";
import { toast } from "utils/Toast";
import SettingsItem from "../../SettingsItem";

const WorkspaceStatusSyncing = () => {
  const [syncRuleStatus, setSyncRuleStatus] = useState(
    localStorage.getItem("syncRuleStatus") === "true" || false
  );

  const handleToggleStatusSyncing = () => {
    if (syncRuleStatus) {
      localStorage.setItem("syncRuleStatus", false);
      setSyncRuleStatus(false);
      toast.success("Status syncing turned off");
      trackSettingsToggled("workspace_status_syncing", false);
    } else {
      localStorage.setItem("syncRuleStatus", true);
      setSyncRuleStatus(true);
      toast.success("Status syncing turned on");
      trackSettingsToggled("workspace_status_syncing", true);
    }
  };

  return (
    <SettingsItem
      isActive={syncRuleStatus}
      onClick={handleToggleStatusSyncing}
      title="Enable status syncing in team workspaces"
      caption="Stay updated by automatically syncing rule modifications with your teammates."
    />
  );
};

export default WorkspaceStatusSyncing;
