import { getValueAsPromise, removeValueAsPromise } from "actions/FirebaseActions";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import {
  getTeamUserRuleAllConfigsPath,
  getTeamUserRuleConfigPath,
  getRecordsSyncPath,
} from "utils/syncing/syncDataUtils";
import { useCurrentWorkspaceUserRole } from "./useCurrentWorkspaceUserRole";
import { trackAttr } from "modules/analytics";

// Broadcast channel setup
window.activeWorkspaceBroadcastChannel = new BroadcastChannel("active-workspace");
window.activeWorkspaceBroadcastChannel.addEventListener("message", (_event) => {
  // Refresh the webpage so that it could find updated state later on
  window.location.reload();
});

const ActiveWorkspace = () => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const user = useSelector(getUserAuthDetails);
  const { role } = useCurrentWorkspaceUserRole();

  const performCleanup = async () => {
    if (window.workspaceCleanupDone) return;

    window.workspaceCleanupDone = true;

    if (activeWorkspace?.id) {
      // Fetch fresh rule configs from Firebase
      const teamUserRuleAllConfigsPath = getTeamUserRuleAllConfigsPath(
        activeWorkspace?.id,
        user?.details?.profile?.uid
      );
      if (!teamUserRuleAllConfigsPath) return;

      const allRulesConfig = await getValueAsPromise(teamUserRuleAllConfigsPath);
      if (!allRulesConfig) return; // It's already empty - No cleanup required
      const allRulesConfigIds = Object.keys(allRulesConfig);

      /* @nsr: should decompress target, but since only working with record keys so ignoring for now */
      // Fetch fresh rule definitions from Firebase
      const allRemoteRecords = (await getValueAsPromise(getRecordsSyncPath())) || {};
      const remoteRecords = {};
      Object.keys(allRemoteRecords).forEach((key) => {
        if (!isEmpty(allRemoteRecords[key]?.id)) {
          remoteRecords[key] = allRemoteRecords[key];
        }
      });
      const allRuleIds = Object.keys(remoteRecords || {});

      const extraConfigIds = allRulesConfigIds.filter((x) => !allRuleIds.includes(x));

      for (const recordId of extraConfigIds) {
        const teamUserRuleConfigPath = getTeamUserRuleConfigPath(recordId);
        if (!teamUserRuleConfigPath) return;
        await removeValueAsPromise(teamUserRuleConfigPath);
      }
    }
  };

  if (!window.workspaceCleanupDone) {
    setTimeout(() => {
      performCleanup();
    }, 3000);
  }

  useEffect(() => {
    trackAttr("active_workspace_id", activeWorkspace?.id || "NONE");
    window.currentlyActiveWorkspaceTeamRole = role;
    window.currentlyActiveWorkspaceTeamId = activeWorkspace?.id;
    window.currentlyActiveWorkspaceType = activeWorkspace?.workspaceType;
    window.workspaceMembersCount = activeWorkspace?.accessCount ?? null;
    window.keySetDonecurrentlyActiveWorkspaceTeamId = true; // NOT USED ANYWHERE
    window.workspaceCleanupDone = false;
  }, [activeWorkspace?.accessCount, activeWorkspace?.id, role, activeWorkspace?.workspaceType]);
};

export default ActiveWorkspace;
