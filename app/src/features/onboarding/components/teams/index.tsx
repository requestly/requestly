import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getAppOnboardingDetails, getUserAuthDetails } from "store/selectors";
import { DefaultTeamView } from "./components/defaultTeamView";
import { JoinTeamView } from "./components/joinTeamsView";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { getPendingInvites } from "backend/workspace";
import { getFunctions, httpsCallable } from "firebase/functions";
import { trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import Logger from "lib/logger";
import { actions } from "store";
import { OnboardingLoader } from "../loader";
import { isNull } from "lodash";
import { trackAppOnboardingGettingStartedViewed, trackAppOnboardingViewed } from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import "./index.scss";

interface WorkspaceOnboardingViewProps {
  isOpen: boolean;
}

export const WorkspaceOnboardingView: React.FC<WorkspaceOnboardingViewProps> = ({ isOpen }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const user = useSelector(getUserAuthDetails);
  const [pendingInvites, setPendingInvites] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const createTeam = useMemo(
    () => httpsCallable<{ teamName: string; generatePublicLink: boolean }>(getFunctions(), "teams-createTeam"),
    []
  );

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

  useEffect(() => {
    if (!user.loggedIn) {
      setIsLoading(false);
      return;
    }

    if (!isCompanyEmail(user?.details?.profile?.email) && !user?.details?.profile?.isEmailVerified) {
      setIsLoading(false);
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.RECOMMENDATIONS));
      return;
    }

    getPendingInvites({ email: true, domain: true })
      .then((res: any) => {
        setPendingInvites(res?.pendingInvites ?? []);
        if (res?.pendingInvites?.length > 0) setIsLoading(false);
        else {
          if (!appOnboardingDetails.createdWorkspace) {
            const newTeamName = `${user.details?.profile?.displayName?.split(" ")[0]}'s team (${
              getDomainFromEmail(user?.details?.profile?.email).split(".")[0]
            })`;
            createTeam({ teamName: newTeamName, generatePublicLink: false })
              .then((response: any) => {
                trackNewTeamCreateSuccess(response?.data?.teamId, newTeamName, "app_onboarding", false);
                handleSwitchWorkspace(response?.data?.teamId, newTeamName);
                dispatch(actions.updateAppOnboardingTeamDetails({ name: newTeamName, ...response?.data }));
                setIsLoading(false);
              })
              .catch((e) => {
                Logger.error(e);
                setIsLoading(false);
              });
          } else setIsLoading(false);
        }
      })
      .catch((e) => {
        Logger.error(e);
        setIsLoading(false);
        setPendingInvites([]);
      });
  }, [
    user.details?.profile?.email,
    user?.details?.profile?.displayName,
    user?.details?.profile?.isEmailVerified,
    user.loggedIn,
    dispatch,
    createTeam,
    appOnboardingDetails.createdWorkspace,
    handleSwitchWorkspace,
  ]);

  useEffect(() => {
    if (!isNull(pendingInvites)) {
      if (!isCompanyEmail(user?.details?.profile?.email)) {
        trackAppOnboardingGettingStartedViewed("no_workspaces");
        return;
      }
      if (pendingInvites.length) {
        trackAppOnboardingGettingStartedViewed("available_to_join");
        return;
      }
      if (appOnboardingDetails.createdWorkspace) {
        trackAppOnboardingGettingStartedViewed("created_workspace");
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
