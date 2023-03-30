import {
  getValueAsPromise,
  removeValueAsPromise,
} from "actions/FirebaseActions";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import {
  getAllTeamUserRulesConfigPath,
  getTeamUserRuleConfigPath,
  getRecordsSyncPath,
} from "utils/syncing/syncDataUtils";

// Broadcast channel setup
window.activeWorkspaceBroadcastChannel = new BroadcastChannel(
  "active-workspace"
);
window.activeWorkspaceBroadcastChannel.addEventListener("message", (_event) => {
  // Refresh the webpage so that it could find updated state later on
  window.location.reload();
});

const ActiveWorkspace = () => {
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const performCleanup = async () => {
    if (window.workspaceCleanupDone) return;

    window.workspaceCleanupDone = true;

    if (currentlyActiveWorkspace.id) {
      // Fetch fresh rule configs from Firebase
      const allRulesConfig = await getValueAsPromise(
        getAllTeamUserRulesConfigPath()
      );
      if (!allRulesConfig) return; // It's already empty - No cleanup required bitch
      const allRulesConfigIds = Object.keys(allRulesConfig);

      // Fetch fresh rule definitions from Firebase
      const allRemoteRecords =
        (await getValueAsPromise(getRecordsSyncPath())) || {};
      const remoteRecords = {};
      Object.keys(allRemoteRecords).forEach((key) => {
        if (!isEmpty(allRemoteRecords[key]?.id)) {
          remoteRecords[key] = allRemoteRecords[key];
        }
      });
      const allRuleIds = Object.keys(remoteRecords || {});

      const extraConfigIds = allRulesConfigIds.filter(
        (x) => !allRuleIds.includes(x)
      );

      for (const recordId of extraConfigIds) {
        await removeValueAsPromise(getTeamUserRuleConfigPath(recordId));
      }
    }
  };

  if (!window.workspaceCleanupDone) {
    setTimeout(() => {
      performCleanup();
    }, 3000);
  }

  useEffect(() => {
    window.currentlyActiveWorkspaceTeamId = currentlyActiveWorkspace.id;
    window.keySetDonecurrentlyActiveWorkspaceTeamId = true;
    window.workspaceCleanupDone = false;
  }, [currentlyActiveWorkspace.id]);

  return null;
};

export default ActiveWorkspace;
