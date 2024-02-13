import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
// import {  getAppOnboardingDetails, getUserAuthDetails } from "store/selectors";
// import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { Col, Row } from "antd";
import { RecommendationGrid } from "./components/recommendations/components/recommendationGrid";
// import {  isCompanyEmail } from "utils/FormattingHelper";
// import { getPendingInvites } from "backend/workspace";
// import { Invite } from "types";
// import { getFunctions, httpsCallable } from "firebase/functions";
// import { actions } from "store";
// import { switchWorkspace } from "actions/TeamWorkspaceActions";
// import Logger from "lib/logger";
// import { OnboardingLoader } from "../loader";
import { m, AnimatePresence } from "framer-motion";
// import { isNull } from "lodash";
// import { trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { trackAppOnboardingViewed } from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import "./index.scss";

interface Props {
  isOpen: boolean;
}

export const RecommendationsView: React.FC<Props> = ({ isOpen }) => {
  // const dispatch = useDispatch();
  // const user = useSelector(getUserAuthDetails);
  // const appMode = useSelector(getAppMode);
  // const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  // const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  // const [isLoading, setIsLoading] = useState(true);
  // const [pendingInvites, setPendingInvites] = useState<Invite[] | null>(null);

  // const createTeam = useMemo(
  //   () => httpsCallable<{ teamName: string; generatePublicLink: boolean }>(getFunctions(), "teams-createTeam"),
  //   []
  // );

  // const handleSwitchWorkspace = useCallback(
  //   (teamId: string, newTeamName: string) => {
  //     switchWorkspace(
  //       {
  //         teamId: teamId,
  //         teamName: newTeamName,
  //         teamMembersCount: 1,
  //       },
  //       dispatch,
  //       { isWorkspaceMode, isSyncEnabled: true },
  //       appMode,
  //       null,
  //       "app_onboarding"
  //     );
  //   },
  //   [dispatch, isWorkspaceMode, appMode]
  // );

  // useEffect(() => {
  //   if (!user.loggedIn) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   if (!isCompanyEmail(user?.details?.profile?.email)) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   getPendingInvites({ email: true, domain: true })
  //     .then((res: any) => {
  //       setPendingInvites(res?.pendingInvites ?? []);
  //       if (res?.pendingInvites?.length > 0) setIsLoading(false);
  //       else {
  //         if (!appOnboardingDetails.createdWorkspace) {
  //           const newTeamName = `${user.details?.profile?.displayName?.split(" ")[0]}'s team (${
  //             getDomainFromEmail(user?.details?.profile?.email).split(".")[0]
  //           })`;
  //           createTeam({ teamName: newTeamName, generatePublicLink: false })
  //             .then((response: any) => {
  //               trackNewTeamCreateSuccess(response?.data?.teamId, newTeamName, "app_onboarding", false);
  //               handleSwitchWorkspace(response?.data?.teamId, newTeamName);
  //               dispatch(actions.updateAppOnboardingTeamDetails({ name: newTeamName, ...response?.data }));
  //               setIsLoading(false);
  //             })
  //             .catch((e) => {
  //               Logger.error(e);
  //               setIsLoading(false);
  //             });
  //         } else setIsLoading(false);
  //       }
  //     })
  //     .catch((e) => {
  //       Logger.error(e);
  //       setIsLoading(false);
  //       setPendingInvites([]);
  //     });
  // }, [
  //   user.details?.profile?.email,
  //   user?.details?.profile?.displayName,
  //   user.loggedIn,
  //   dispatch,
  //   createTeam,
  //   appOnboardingDetails.createdWorkspace,
  //   handleSwitchWorkspace,
  // ]);

  // useEffect(() => {
  //   if (!isNull(pendingInvites)) {
  //     if (!isCompanyEmail(user?.details?.profile?.email)) {
  //       trackAppOnboardingGettingStartedViewed("no_workspaces");
  //       return;
  //     }
  //     if (pendingInvites.length) {
  //       trackAppOnboardingGettingStartedViewed("available_to_join");
  //       return;
  //     }
  //     if (appOnboardingDetails.createdWorkspace) {
  //       trackAppOnboardingGettingStartedViewed("created_workspace");
  //       return;
  //     }
  //   }
  // }, [pendingInvites, user?.details?.profile?.email, appOnboardingDetails.createdWorkspace]);

  useEffect(() => {
    if (isOpen) {
      trackAppOnboardingViewed(ONBOARDING_STEPS.GETTING_STARTED);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="getting-started-screen-wrapper"
      >
        {/* <Col className="getting-started-screen-banner">
            <div className="get-started-title">GET STARTED</div>
            <Typography.Title level={3} className="welcome-title">
              Welcome to Requestly, {name}!
            </Typography.Title>
            <Typography.Title level={5} className="getting-started-banner-by-line">
              Select an option below to get started quickly
            </Typography.Title>
          </Col> */}
        <Row className="getting-started-body">
          {/* {isCompanyEmail(user?.details?.profile?.email) && !isNull(pendingInvites) && (
              <Col className="getting-started-teams-wrapper">
                <WorkspaceOnboardingView pendingInvites={pendingInvites} />
              </Col>
            )} */}
          <Col className="getting-started-recommendations-wrapper">
            <RecommendationGrid />
          </Col>
        </Row>
      </m.div>
    </AnimatePresence>
  );
};
