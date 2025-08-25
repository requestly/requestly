import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getLastSeenInviteTs } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackWorkspaceInviteAnimationViewed } from "modules/analytics/events/common/teams";
import { getPendingInvites } from "backend/workspace";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";
import WorkSpaceDropdown from "./components/WorkspaceDropdown";
import "./WorkSpaceSelector.css";

export const isWorkspacesFeatureEnabled = (email: string) => {
  if (!email) return false;
  return true;
};

const WorkspaceSelector = () => {
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);

  const lastSeenInviteTs = useSelector(getLastSeenInviteTs);

  const [teamInvites, setTeamInvites] = useState([]);

  const hasNewInvites = useMemo(() => {
    if (user?.loggedIn && teamInvites?.length) {
      return teamInvites.some((invite) => invite.createdTs > lastSeenInviteTs);
    }
    return false;
  }, [lastSeenInviteTs, teamInvites, user?.loggedIn]);

  useEffect(() => {
    if (hasNewInvites) trackWorkspaceInviteAnimationViewed();
  }, [hasNewInvites]);

  useEffect(() => {
    if (!user.loggedIn) return;

    getPendingInvites({ email: true, domain: true })
      .then((res) => {
        setTeamInvites(res?.pendingInvites ?? []);
      })
      .catch((e) => setTeamInvites([]));
  }, [user.loggedIn]);

  useEffect(() => {
    if (availableWorkspaces?.length > 0) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_WORKSPACES, availableWorkspaces.length);
    }
  }, [availableWorkspaces?.length]);

  return (
    <>
      <WorkSpaceDropdown teamInvites={teamInvites} />
    </>
  );
};

export default WorkspaceSelector;
