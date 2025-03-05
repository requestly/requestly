// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { globalActions } from "store/slices/global/slice";
// import { getAppMode } from "store/selectors";
// import { getUserAuthDetails } from "store/slices/global/user/selectors";
// // import { setSyncState } from "utils/syncing/SlyncUtils";
// import { toast } from "utils/Toast";
// import { SOURCE } from "modules/analytics/events/common/constants";
// import SettingsItem from "./SettingsItem";
// import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
// import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";
// import { getActiveWorkspaceId, isPersonalWorkspace } from "features/workspaces/utils";

// const RulesSyncing = () => {
//   const dispatch = useDispatch();
//   const appMode = useSelector(getAppMode);
//   const user = useSelector(getUserAuthDetails);
//   const activeWorkspaceId = getActiveWorkspaceId(useSelector(getActiveWorkspaceIds));
//   const isSharedWorkspaceMode = !isPersonalWorkspace(activeWorkspaceId);
//   const [isSyncStatusChangeProcessing, setIsSyncStatusChangeProcessing] = useState(false);
//   const isUserLoggedIn = !!(user?.loggedIn || user?.details || user?.details?.profile);

//   const handleRulesSyncToggle = (status) => {
//     if (!user.loggedIn || !user.details || !user.details.profile) {
//       dispatch(
//         globalActions.toggleActiveModal({
//           modalName: "authModal",
//           newValue: true,
//           newProps: {
//             redirectURL: window.location.href,
//             eventSource: SOURCE.ENABLE_SYNC,
//           },
//         })
//       );
//       return;
//     }

//     // setIsSyncStatusChangeProcessing(true);
//     // setSyncState(user.details.profile.uid, status, appMode)
//     //   .then(() => {
//     //     toast.info(`We ${status ? "will" : "won't"} be syncing your rules automatically hereon.`);
//     //   })
//     //   .catch(() => {
//     //     toast.error(`Sorry, we are experiencing issues updating the sync state.`);
//     //   })
//     //   .finally(() => setIsSyncStatusChangeProcessing(false));

//     trackSettingsToggled("rules_syncing", status);
//   };

//   return (
//     <SettingsItem
//       isActive={isUserLoggedIn && (isSharedWorkspaceMode || (user?.details?.isSyncEnabled ?? false))}
//       onChange={handleRulesSyncToggle}
//       disabled={isSharedWorkspaceMode}
//       loading={isSyncStatusChangeProcessing}
//       title="Enable syncing"
//       toolTipTitle={isSharedWorkspaceMode ? "Syncing is on" : ""}
//       caption="Always keep your rules in sync irrespective of the device you use."
//     />
//   );
// };

// export default RulesSyncing;
