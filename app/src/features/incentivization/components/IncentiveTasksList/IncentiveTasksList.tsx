import React, { useCallback, useMemo } from "react";
import { Collapse } from "antd";
import { CreditsProgressBar } from "../CreditsProgressbar/CreditsProgessbar";
import { IncentiveSectionHeader } from "../IncentiveSectionHeader";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  redirectToCreateNewRule,
  redirectToMocks,
  redirectToRules,
  redirectToSessionRecordingHome,
} from "utils/RedirectionUtils";
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
import { trackIncentivizationTaskClicked } from "features/incentivization/analytics";
import { RQButton } from "lib/design-system/components";
import { INCENTIVIZATION_SOURCE } from "features/incentivization/analytics/constants";
import { RuleType } from "types";
import { isExtensionInstalled } from "actions/ExtensionActions";
import PATHS from "config/constants/sub/paths";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import "./incentiveTasksList.scss";

interface IncentiveTasksListProps {
  source: string;
}
export const IncentiveTasksList: React.FC<IncentiveTasksListProps> = ({ source }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(getIsIncentivizationDetailsLoading);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);

  const postActionClickCallback = useCallback(
    (task: IncentivizeEvent) => {
      // @ts-ignore
      dispatch(actions.toggleActiveModal({ modalName: "incentiveTasksListModal", newValue: false }));
      trackIncentivizationTaskClicked(task);
    },
    [dispatch]
  );

  const incentiveTasksList: IncentiveTaskListItem[] = useMemo(
    () => [
      {
        id: IncentivizeEvent.FIRST_RULE_CREATED,
        title: "Create your first rule",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_RULE_CREATED, userMilestoneDetails),
        description:
          "Rules enable you to set conditions that trigger specific actions when met. To apply desired network modifications",
        icon: <MdPlaylistAdd />,
        helpLink: (
          <a href="https://developers.requestly.com/create-first-rule/" target="_blank" rel="noreferrer">
            Learn how to create Rules
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.FIRST_RULE_CREATED],
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_RULE_CREATED, userMilestoneDetails);
          return (
            <NewRuleButtonWithDropdown
              disable={isCompleted}
              callback={() => postActionClickCallback(IncentivizeEvent.FIRST_RULE_CREATED)}
            />
          );
        },
      },
      {
        id: IncentivizeEvent.RULE_TESTED,
        title: location.pathname.includes(PATHS.RULE_EDITOR.EDIT_RULE.RELATIVE) ? "Test this rule" : "Test a rule",
        isCompleted: isTaskCompleted(IncentivizeEvent.RULE_TESTED, userMilestoneDetails),
        description:
          "Test your rule on a specific URL to see if it works as expected. You can test your rule on any website.",
        icon: <MdOutlineScience />,
        helpLink: (
          <a href="https://developers.requestly.com/http-rules/test-this-rule/" target="_blank" rel="noreferrer">
            Learn how to test a rule
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.RULE_TESTED],
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.RULE_TESTED, userMilestoneDetails);
          const isRuleEditorOpened = location.pathname.includes(PATHS.RULE_EDITOR.EDIT_RULE.RELATIVE);
          return (
            <RQButton
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                if (!isRuleEditorOpened) {
                  redirectToRules(navigate);
                }
                postActionClickCallback(IncentivizeEvent.RULE_TESTED);
              }}
            >
              {isRuleEditorOpened ? "Test this rule" : "Test a rule"}
            </RQButton>
          );
        },
      },
      {
        id: IncentivizeEvent.RESPONSE_RULE_CREATED,
        title: "Create a Response Rule",
        isCompleted: isTaskCompleted(IncentivizeEvent.RESPONSE_RULE_CREATED, userMilestoneDetails),
        description: "Modify Response Rule allows you to debug & modify API responses on the fly",
        icon: <MdPlaylistAdd />,
        helpLink: (
          <a href="https://developers.requestly.com/http-rules/modify-response-body/" target="_blank" rel="noreferrer">
            Learn how to a create Response Rule
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.RESPONSE_RULE_CREATED],
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.RESPONSE_RULE_CREATED, userMilestoneDetails);
          return (
            <RQButton
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                if (isExtensionInstalled()) {
                  redirectToCreateNewRule(navigate, RuleType.RESPONSE, INCENTIVIZATION_SOURCE.INCENTIVES_TASK_LIST);
                  postActionClickCallback(IncentivizeEvent.RESPONSE_RULE_CREATED);
                } else {
                  dispatch(
                    // @ts-ignore
                    actions.toggleActiveModal({
                      modalName: "extensionModal",
                      newValue: true,
                      newProps: {
                        eventPage: INCENTIVIZATION_SOURCE.INCENTIVES_TASK_LIST,
                      },
                    })
                  );
                }
              }}
            >
              Create a Response Rule
            </RQButton>
          );
        },
      },
      {
        id: IncentivizeEvent.REDIRECT_RULE_CREATED,
        title: "Create a Redirect Rule",
        isCompleted: isTaskCompleted(IncentivizeEvent.REDIRECT_RULE_CREATED, userMilestoneDetails),
        description: "Redirect Rule allows you to redirect a network request to a different URL.",
        icon: <MdPlaylistAdd />,
        helpLink: (
          <a
            href="https://developers.requestly.com/http-rules/map-local-url-redirect/"
            target="_blank"
            rel="noreferrer"
          >
            Learn how to create a Redirect Rule
          </a>
        ),
        milestone: milestones?.[IncentivizeEvent.REDIRECT_RULE_CREATED],
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.REDIRECT_RULE_CREATED, userMilestoneDetails);
          return (
            <RQButton
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                if (isExtensionInstalled()) {
                  redirectToCreateNewRule(navigate, RuleType.REDIRECT, INCENTIVIZATION_SOURCE.INCENTIVES_TASK_LIST);
                  postActionClickCallback(IncentivizeEvent.REDIRECT_RULE_CREATED);
                } else {
                  dispatch(
                    // @ts-ignore
                    actions.toggleActiveModal({
                      modalName: "extensionModal",
                      newValue: true,
                      newProps: {
                        eventPage: INCENTIVIZATION_SOURCE.INCENTIVES_TASK_LIST,
                      },
                    })
                  );
                }
              }}
            >
              Create a Redirect Rule
            </RQButton>
          );
        },
      },
      {
        id: IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED,
        title: "Create a Team Workspace",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED, userMilestoneDetails),
        description:
          "A Team Workspace lets you collaborate with your team and work together in real-time on your rules, mocks and sessions.",
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
              onClick={() => {
                postActionClickCallback(IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED);
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
                );
              }}
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
        description:
          "Generate a mock API endpoint to simulate your API without needing to configure a real API server.",
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
            <Button
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                postActionClickCallback(IncentivizeEvent.FIRST_MOCK_CREATED);
                redirectToMocks(navigate);
              }}
            >
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
          "SessionBook allows you to capture, report, and debug errors. Easily capture mouse movements and screen recording along with network & console logs.",
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
            <Button
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                postActionClickCallback(IncentivizeEvent.FIRST_SESSION_RECORDED);
                redirectToSessionRecordingHome(navigate);
              }}
            >
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

                postActionClickCallback(IncentivizeEvent.RATE_ON_CHROME_STORE);

                window.open(LINKS.CHROME_STORE_REVIEWS, "blank");
              }}
            >
              Rate now
            </Button>
          );
        },
      },
    ],
    [milestones, userMilestoneDetails, dispatch, navigate, location.pathname, postActionClickCallback]
  );

  return (
    <div className="incentive-tasks-list-container">
      <IncentiveSectionHeader title={`Complete onboarding and earn $${totalCredits} Free credits`} />
      <div className="mt-16">
        <CreditsProgressBar source={source} />
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
