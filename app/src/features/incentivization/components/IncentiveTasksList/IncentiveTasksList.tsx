import { useMemo } from "react";
import { Collapse } from "antd";
import { CreditsProgressBar } from "../CreditsProgressbar/CreditsProgessbar";
import { IncentiveSectionHeader } from "../IncentiveSectionHeader";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TaskHeader } from "./components/TaskHeader/TaskHeader";
import { UserMilestoneDetails } from "features/incentivization/types";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import { MdPlaylistAdd } from "@react-icons/all-files/md/MdPlaylistAdd";
import { MdOutlineDiversity1 } from "@react-icons/all-files/md/MdOutlineDiversity1";
import { MdOutlineDns } from "@react-icons/all-files/md/MdOutlineDns";
import { PiRecordFill } from "@react-icons/all-files/pi/PiRecordFill";
import { MdOutlineStarBorder } from "@react-icons/all-files/md/MdOutlineStarBorder";
import { NewRuleButtonWithDropdown } from "features/rules/screens/rulesList/components/RulesList/components";
import { Button } from "antd";
import { redirectToMocks, redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { actions } from "store";
import { IncentivizeEvent } from "features/incentivization/types";
import { IncentiveTaskListItem } from "./types";
import {
  getIncentivizationMilestones,
  getIncentivizationUserMilestoneDetails,
  getIsIncentivizationDetailsLoading,
} from "store/features/incentivization/selectors";
import { getTotalCredits, isTaskCompleted } from "features/incentivization/utils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { incentivizationActions } from "store/features/incentivization/slice";
import LINKS from "config/constants/sub/links";
import "./incentiveTasksList.scss";

export const IncentiveTasksList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(getIsIncentivizationDetailsLoading);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);

  const incentiveTasksList: IncentiveTaskListItem[] = useMemo(
    () => [
      {
        id: IncentivizeEvent.FIRST_RULE_CREATED,
        title: "Create your first rule",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_RULE_CREATED, userMilestoneDetails),
        description:
          "Use rules to intercept & modify network requests, headers, API requests, inject scripts & much more. Upon creating your first rule you will earn $25 free credits for professional plan.",
        icon: <MdPlaylistAdd />,
        helpLink: (
          <a href="https://developers.requestly.com/create-first-rule/" target="_blank" rel="noreferrer">
            Learn how to create Rules
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.FIRST_RULE_CREATED],
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_RULE_CREATED, userMilestoneDetails);
          return <NewRuleButtonWithDropdown disable={isCompleted} />;
        },
      },
      {
        id: IncentivizeEvent.PREMIUM_RULE_CREATED,
        title: "Create other rules",
        isCompleted: isTaskCompleted(IncentivizeEvent.PREMIUM_RULE_CREATED, userMilestoneDetails),
        description:
          "Use premium rules to modify requests, response, & inject scripts. Upon creating your first premium rule you will earn $15 free credits for professional plan.",
        icon: <MdPlaylistAdd />,
        helpLink: (
          <a href="https://developers.requestly.com/http-rules/overview/" target="_blank" rel="noreferrer">
            Learn how to create Rules
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.PREMIUM_RULE_CREATED],
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.PREMIUM_RULE_CREATED, userMilestoneDetails);
          return <NewRuleButtonWithDropdown disable={isCompleted} />;
        },
      },
      {
        id: IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED,
        title: "Create a Team Workspace",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED, userMilestoneDetails),
        description:
          "Team Workspaces let you share your debugging workflows with your teammates in real time. Everyone can collaborate on things like Rules, Mock APIs and Session replays.",
        icon: <MdOutlineDiversity1 />,
        helpLink: (
          <a href="https://developers.requestly.com/workspace/using-workspace/" target="_blank" rel="noreferrer">
            Learn how to create Team Workspace
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED],
        action: ({ dispatch }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED, userMilestoneDetails);

          return (
            <Button
              disabled={isCompleted}
              type="primary"
              onClick={() =>
                dispatch(
                  // @ts-ignore
                  actions.toggleActiveModal({
                    modalName: "createWorkspaceModal",
                    newValue: true,
                    newProps: {
                      callback: () => {
                        // @ts-ignore
                        dispatch(actions.updateJoinWorkspaceCardVisible(false));
                      },
                      source: "incentivization_task_list",
                    },
                  })
                )
              }
            >
              Create a new workspace
            </Button>
          );
        },
      },
      {
        id: IncentivizeEvent.FIRST_MOCK_CREATED,
        title: "Create an API Mock",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_MOCK_CREATED, userMilestoneDetails),
        description: "Create mocks for your APIs with different status codes, delay, response headers or body",
        icon: <MdOutlineDns />,
        helpLink: (
          <a href="https://developers.requestly.com/mock-server/create-new-mock-api/" target="_blank" rel="noreferrer">
            Learn how to create API Mock
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.FIRST_MOCK_CREATED],
        action: ({ navigate }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_MOCK_CREATED, userMilestoneDetails);

          return (
            <Button disabled={isCompleted} type="primary" onClick={() => redirectToMocks(navigate)}>
              Create a mock API
            </Button>
          );
        },
      },
      {
        id: IncentivizeEvent.FIRST_SESSION_RECORDED,
        title: "Record a session",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_SESSION_RECORDED, userMilestoneDetails),
        description:
          "Session replays allows you to capture, report, and debug errors with the power of session replay and network & console logs.",
        icon: <PiRecordFill />,
        helpLink: (
          <a href="https://developers.requestly.com/sessions/record-session/" target="_blank" rel="noreferrer">
            Learn how to record a session
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.FIRST_SESSION_RECORDED],
        action: ({ navigate }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_SESSION_RECORDED, userMilestoneDetails);

          return (
            <Button disabled={isCompleted} type="primary" onClick={() => redirectToSessionRecordingHome(navigate)}>
              Record a session
            </Button>
          );
        },
      },
      {
        id: IncentivizeEvent.RATE_ON_CHROME_STORE,
        title: "Rate us on Chrome Store",
        isCompleted: isTaskCompleted(IncentivizeEvent.RATE_ON_CHROME_STORE, userMilestoneDetails),
        description: "Give a rating on chrome store.",
        icon: <MdOutlineStarBorder />,
        milestone: milestones?.[IncentivizeEvent.RATE_ON_CHROME_STORE],
        action: ({ navigate }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.RATE_ON_CHROME_STORE, userMilestoneDetails);

          return (
            <Button
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                setTimeout(() => {
                  const claimIncentiveRewards = httpsCallable(getFunctions(), "incentivization-claimIncentiveRewards");
                  claimIncentiveRewards({ event: IncentivizeEvent.RATE_ON_CHROME_STORE }).then(
                    (response: { data: { success: boolean; data: UserMilestoneDetails } }) => {
                      if (response.data?.success) {
                        dispatch(
                          incentivizationActions.setUserMilestoneDetails({ userMilestoneDetails: response.data?.data })
                        );

                        dispatch(
                          // @ts-ignore
                          actions.toggleActiveModal({
                            modalName: "incentiveTaskCompletedModal",
                            newValue: true,
                            newProps: { event: IncentivizeEvent.RATE_ON_CHROME_STORE },
                          })
                        );
                      }
                    }
                  );
                }, 1000 * 20);

                window.open(LINKS.CHROME_STORE_REVIEWS, "blank");
              }}
            >
              Rate now
            </Button>
          );
        },
      },
    ],
    [milestones, userMilestoneDetails]
  );

  return (
    <div className="incentive-tasks-list-container">
      <IncentiveSectionHeader title={`Complete onboarding and earn $${totalCredits} Free credits`} />
      <div className="mt-24">
        <CreditsProgressBar />
      </div>
      <div className="incentive-tasks-list">
        {isLoading ? (
          <div className="loader">
            <Loading3QuartersOutlined spin />
          </div>
        ) : (
          <Collapse
            className="incentive-tasks-list-collapse"
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <div className="collapse-arrow-container">
                <PiCaretDownBold className={`collapse-arrow-down ${isActive ? "rotate" : ""}`} />
              </div>
            )}
          >
            {incentiveTasksList.map((task, index) => (
              <Collapse.Panel header={<TaskHeader task={task} />} key={index}>
                <div className="incentive-task-content">
                  {task.description ? <div className="incentive-task-description">{task.description}</div> : null}

                  <div className="incentive-task-actions">
                    {task.action({
                      dispatch,
                      navigate,
                    })}
                    {task?.helpLink ? <div className="incentive-task-help-link">{task?.helpLink}</div> : null}
                  </div>
                </div>
              </Collapse.Panel>
            ))}
          </Collapse>
        )}
      </div>
    </div>
  );
};
