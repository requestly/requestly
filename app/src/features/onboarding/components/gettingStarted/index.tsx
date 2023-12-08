import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getAppOnboardingDetails, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { Col, Row, Typography } from "antd";
import { RecommendationView } from "./components/recommendations/components/recommendationView";
import { WorkspaceOnboardingView } from "./components/workspaceOnboarding";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { getPendingInvites } from "backend/workspace";
import { Invite } from "types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { capitalize } from "lodash";
import { actions } from "store";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import Logger from "lib/logger";
import "./index.scss";

export const GettingStartedView: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const name =
    user.details.profile.displayName !== "User" ? user.details.profile.displayName : appOnboardingDetails.fullName;

  const createTeam = useMemo(
    () => httpsCallable<{ teamName: string; generatePublicLink: boolean }>(getFunctions(), "teams-createTeam"),
    []
  );

  const handleSwitchWorkspace = (teamId: string, newTeamName: string) => {
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
  };

  useEffect(() => {
    if (!isCompanyEmail(user?.details?.profile?.email)) return;

    getPendingInvites({ email: true, domain: true })
      .then((res: any) => {
        setPendingInvites(res?.pendingInvites ?? []);
        if (res?.pendingInvites?.length > 0) setIsLoading(false);
        else {
          if (!appOnboardingDetails.createdWorkspace) {
            const newTeamName = `${capitalize(
              getDomainFromEmail(user?.details?.profile?.email).split(".")[0]
            )}<My team>`;
            createTeam({ teamName: newTeamName, generatePublicLink: false })
              .then((response: any) => {
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
  }, [user?.details?.profile?.email, dispatch, createTeam, appOnboardingDetails.createdWorkspace]);

  return (
    <Col className="getting-started-screen-wrapper">
      {/* BANNER */}
      {isLoading ? (
        <h1>SETTING UP...</h1> //TODO: Add loader
      ) : (
        <>
          <Col className="getting-started-screen-banner">
            <div className="get-started-title">GET STARTED</div>
            <Typography.Title level={3} className="welcome-title">
              Welcome to Requestly, {name}!
            </Typography.Title>
            <Typography.Title level={5} className="getting-started-banner-by-line">
              Select an option below to get started quickly
            </Typography.Title>
          </Col>
          <Row className="getting-started-body">
            {isCompanyEmail(user?.details?.profile?.email) && (
              <Col className="getting-started-teams-wrapper">
                <WorkspaceOnboardingView pendingInvites={pendingInvites} />
              </Col>
            )}
            <Col className="getting-started-recommendations-wrapper">
              <RecommendationView />
            </Col>
          </Row>
        </>
      )}
    </Col>
  );
};
