import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getAppOnboardingDetails } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { DefaultTeamView } from "./components/defaultTeamView";
import { JoinTeamView } from "./components/joinTeamsView";
import { isCompanyEmail } from "utils/FormattingHelper";
import { getPendingInvites } from "backend/workspace";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import { OnboardingLoader } from "../loader";
import { isNull } from "lodash";
import { trackAppOnboardingTeamsViewed, trackAppOnboardingViewed } from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import "./index.scss";
import { redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { Invite } from "types";

interface WorkspaceOnboardingViewProps {
  isOpen: boolean;
}

export const WorkspaceOnboardingView: React.FC<WorkspaceOnboardingViewProps> = ({ isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const user = useSelector(getUserAuthDetails);
  const [pendingInvites, setPendingInvites] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSwitchWorkspace = useCallback(
    (teamId: string, newTeamName: string) => {
      switchWorkspace(
        {
          teamId: teamId,
          teamName: newTeamName,
          teamMembersCount: 1,
        },
        dispatch,
        { isWorkspaceMode, isSyncEnabled: true },
        appMode,
        null,
        "app_onboarding"
      );
    },
    [dispatch, isWorkspaceMode, appMode]
  );

  const handlePendingInvites = useCallback(
    (res: { pendingInvites: Invite[]; success: boolean }) => {
      setPendingInvites(res?.pendingInvites ?? []);
      if (res?.pendingInvites?.length > 0) setIsLoading(false);
      else {
        setIsLoading(false);
        redirectToWebAppHomePage(navigate);
        dispatch(globalActions.updateAppOnboardingCompleted());
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "appOnboardingModal",
            newValue: false,
          })
        );
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!user.loggedIn) {
      setIsLoading(false);
      return;
    }

    if (!isCompanyEmail(user?.details?.profile?.email) || !user?.details?.profile?.isEmailVerified) {
      setIsLoading(false);
      redirectToWebAppHomePage(navigate);
      dispatch(globalActions.updateAppOnboardingCompleted());
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "appOnboardingModal",
          newValue: false,
        })
      );
      return;
    }

    getPendingInvites({ email: true, domain: true })
      .then(handlePendingInvites)
      .catch((e) => {
        Logger.error(e);
        setIsLoading(false);
        setPendingInvites([]);
      });
  }, [
    user?.details?.profile?.email,
    user?.details?.profile?.isEmailVerified,
    user.loggedIn,
    dispatch,
    handleSwitchWorkspace,
    handlePendingInvites,
  ]);

  useEffect(() => {
    if (!isNull(pendingInvites)) {
      if (!isCompanyEmail(user?.details?.profile?.email)) {
        trackAppOnboardingTeamsViewed("no_workspaces");
        return;
      }
      if (pendingInvites.length) {
        trackAppOnboardingTeamsViewed("available_to_join");
        return;
      }
      if (appOnboardingDetails.createdWorkspace) {
        trackAppOnboardingTeamsViewed("created_workspace");
        return;
      }
    }
  }, [pendingInvites, user?.details?.profile?.email, appOnboardingDetails.createdWorkspace]);

  useEffect(() => {
    if (isOpen) {
      trackAppOnboardingViewed(ONBOARDING_STEPS.TEAMS);
    }
  }, [isOpen]);

  if (isLoading || isNull(pendingInvites)) return <OnboardingLoader />;
  if (pendingInvites?.length) return <JoinTeamView pendngInvites={pendingInvites} />;
  if (appOnboardingDetails.createdWorkspace) return <DefaultTeamView />;
};
