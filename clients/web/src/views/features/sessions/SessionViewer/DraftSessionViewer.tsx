import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unstable_usePrompt, useNavigate, useParams } from "react-router-dom";
import { getAppMode, getIsMiscTourCompleted, getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getTabSession } from "actions/ExtensionActions";
import { Input, Modal, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSession } from "@requestly/web-sdk";
import mockSession from "./mockData/mockSession";
import DownArrow from "assets/icons/down-arrow.svg?react";
import PageLoader from "components/misc/PageLoader";
import { getSessionRecordingEvents, getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import PageError from "components/misc/PageError";
import SaveRecordingConfigPopup from "./SaveRecordingConfigPopup";
import { saveDraftSession, generateDraftSessionTitle } from "features/sessionBook/screens/DraftSessionScreen/utils";
import { globalActions } from "store/slices/global/slice";
import PATHS from "config/constants/sub/paths";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS } from "components/misc/ProductWalkthrough/constants";
import { DRAFT_SESSION_VIEWED_SOURCE } from "./constants";
import {
  trackDraftSessionDiscarded,
  trackDraftSessionViewed,
  trackSessionRecordingFailed,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";
import LINKS from "config/constants/sub/links";
import {
  trackTestRuleSessionDraftViewed,
  trackTroubleshootClicked,
} from "modules/analytics/events/features/ruleEditor";
import { DebugInfo, SessionRecordingMode } from "./types";
import { SOURCE } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
import { toast } from "utils/Toast";
import { LOGGER as Logger } from "@requestly/utils";
import { SUB_TOUR_TYPES, TOUR_TYPES } from "components/misc/ProductWalkthrough/types";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
export interface DraftSessionViewerProps {
  testRuleDraftSession?: {
    draftSessionTabId: string;
    testReportId: string;
    closeModal: () => void;
    appliedRuleStatus: boolean;
  };
  source?: string;
  desktopMode?: boolean;
}

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({
  testRuleDraftSession,
  source = DRAFT_SESSION_VIEWED_SOURCE.DEFAULT,
  desktopMode = false,
}) => {
  const tempTabId = useParams().tabId ?? testRuleDraftSession?.draftSessionTabId;
  const tabId = useMemo(() => (desktopMode ? "imported" : tempTabId), [desktopMode, tempTabId]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const isImportedSession = tabId === "imported";

  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string>();
  const [isSavePopupVisible, setIsSavePopupVisible] = useState(false);
  const [isSaveSessionClicked, setIsSaveSessionClicked] = useState(false);
  const [isDiscardSessionClicked, setIsDiscardSessionClicked] = useState(false);
  const [isSessionSaving, setIsSessionSaving] = useState(false);

  const hasUserCreatedSessions = useMemo(
    () =>
      userAttributes?.num_sessions > 0 ||
      userAttributes?.num_sessions_saved_online - 1 > 0 ||
      userAttributes?.num_sessions_saved_offline > 0,
    [
      userAttributes?.num_sessions,
      userAttributes?.num_sessions_saved_online,
      userAttributes?.num_sessions_saved_offline,
    ]
  );

  useEffect(() => {
    const unloadListener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Exiting without saving will discard the draft.\nAre you sure you want to exit?";
    };

    if (!desktopMode) {
      console.log("added when should not added", desktopMode);
      // It is fired only if there was ANY interaction of the user with the site.
      // Without ANY interaction (even a click anywhere) event onbeforeunload won't be fired
      // https://stackoverflow.com/questions/24081699/why-onbeforeunload-event-is-not-firing
      window.addEventListener("beforeunload", unloadListener);

      return () => window.removeEventListener("beforeunload", unloadListener);
    }
  }, [desktopMode]);

  if (!desktopMode) {
    console.log("added when should not added", desktopMode);

    unstable_usePrompt({
      when: !isSaveSessionClicked && !isDiscardSessionClicked && !testRuleDraftSession,
      message: "Exiting without saving will discard the draft.\nAre you sure you want to exit?",
    });
  }
  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if (isImportedSession && sessionRecordingMetadata === null && !desktopMode) {
      navigate(PATHS.SESSIONS.ABSOLUTE);
    }
  }, [navigate, isImportedSession, sessionRecordingMetadata, desktopMode]);

  useEffect(() => {
    setIsLoading(true);

    if (tabId === "imported") {
      setIsLoading(false);
    } else if (tabId === "mock") {
      // TODO: remove mock flow
      dispatch(
        sessionRecordingActions.setSessionRecordingMetadata({
          sessionAttributes: mockSession.attributes,
          name: "Mock Session Recording",
        })
      );
      dispatch(sessionRecordingActions.setEvents(mockSession.events));
      setIsLoading(false);
    } else {
      getTabSession(parseInt(tabId)).then((payload: unknown) => {
        if (typeof payload === "string") {
          setLoadingError(payload);
        } else {
          const tabSession = payload as RQSession & { recordingMode?: SessionRecordingMode };
          if (!tabSession) {
            return;
          }

          if (tabSession.events.rrweb?.length < 2) {
            setLoadingError("RRWeb events not captured");
          } else {
            dispatch(
              sessionRecordingActions.setSessionRecordingMetadata({
                sessionAttributes: tabSession.attributes,
                name: generateDraftSessionTitle(tabSession.attributes?.url),
                recordingMode: tabSession.recordingMode || null,
              })
            );

            dispatch(sessionRecordingActions.setEvents(tabSession.events));
          }
        }
        setIsLoading(false);
      });
    }
  }, [dispatch, tabId, user?.details?.profile?.email, testRuleDraftSession, source]);

  useEffect(() => {
    trackDraftSessionViewed(sessionRecordingMetadata?.recordingMode);

    if (testRuleDraftSession) {
      trackTestRuleSessionDraftViewed();
    }
  }, [sessionRecordingMetadata?.recordingMode, source, testRuleDraftSession]);

  const confirmDiscard = useCallback(() => {
    setIsDiscardSessionClicked(true);
    Modal.confirm({
      title: "Confirm Discard",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to discard this draft recording?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        trackDraftSessionDiscarded();
        if (testRuleDraftSession) {
          testRuleDraftSession.closeModal();
        } else {
          navigate(PATHS.SESSIONS.ABSOLUTE);
        }
      },
      onCancel() {
        setIsDiscardSessionClicked(false);
      },
    });
  }, [navigate, testRuleDraftSession]);

  // CURRENTLY THIS FUNCTION IS REDUNDANT, USED BY DRAFT SESSION VIEWER AND SAVE POPUP
  // TODO: REFACTOR THIS WHEN REVAMP TASK IS PICKED
  const handleSaveDraftSession = useCallback(() => {
    if (!user?.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: AUTH_ACTION_LABELS.SIGN_UP,
            src: window.location.href,
            eventSource: SOURCE.SAVE_DRAFT_SESSION,
          },
        })
      );
      return;
    }

    if (isSessionSaving) {
      return;
    }

    if (!sessionRecordingMetadata?.name) {
      toast.error("Name is required to save the recording.");
      return;
    }

    setIsSessionSaving(true);
    setIsSaveSessionClicked(true);
    saveDraftSession(
      user,
      userAttributes,
      appMode,
      dispatch,
      navigate,
      activeWorkspaceId,
      sessionRecordingMetadata,
      sessionEvents,
      [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS],
      source
    )
      .catch((err) => {
        setIsSessionSaving(false);
        Logger.log("Error while saving draft session", err);
      })
      .finally(() => {
        setIsSessionSaving(false);
      });
  }, [
    appMode,
    dispatch,
    navigate,
    sessionEvents,
    sessionRecordingMetadata,
    source,
    user,
    userAttributes,
    activeWorkspaceId,
    isSessionSaving,
  ]);

  useEffect(() => {
    if (loadingError) {
      trackSessionRecordingFailed(loadingError);
    }
  }, [loadingError]);

  return isLoading ? (
    <PageLoader message="Loading session details..." />
  ) : loadingError ? (
    <PageError error="Session Recording Loading Error" />
  ) : (
    <div className="session-viewer-page">
      <div className="session-viewer-header margin-bottom-one">
        <SessionViewerTitle />
        <div className="session-viewer-actions">
          {!desktopMode && (
            <RQButton type="default" onClick={confirmDiscard}>
              Discard
            </RQButton>
          )}
          <div className="save-session-btns-container" data-tour-id="save-draft-session-btn">
            <RQButton
              type="primary"
              className="text-bold session-viewer-save-action-btn"
              loading={isSessionSaving}
              onClick={() => {
                handleSaveDraftSession();
                globalActions.updateProductTourCompleted({
                  tour: TOUR_TYPES.MISCELLANEOUS,
                  subTour: SUB_TOUR_TYPES.FIRST_DRAFT_SESSION,
                });
              }}
            >
              Save
            </RQButton>
            <RQButton
              disabled={isSessionSaving}
              size="small"
              type="primary"
              className="save-popup-button"
              onClick={() => {
                setIsSavePopupVisible((prev) => !prev);
                dispatch(
                  globalActions.updateProductTourCompleted({
                    tour: TOUR_TYPES.MISCELLANEOUS,
                    subTour: SUB_TOUR_TYPES.FIRST_DRAFT_SESSION,
                  })
                );
              }}
            >
              <DownArrow />
            </RQButton>
          </div>

          {isSavePopupVisible && (
            <SaveRecordingConfigPopup
              onClose={() => setIsSavePopupVisible(false)}
              setIsSaveSessionClicked={setIsSaveSessionClicked}
              testRuleDraftSession={testRuleDraftSession}
              source={source}
            />
          )}
        </div>
      </div>
      {testRuleDraftSession && (
        <Space align="center">
          <Input
            readOnly
            addonBefore="Rule execution status"
            value={testRuleDraftSession.appliedRuleStatus ? "✅ Rule executed" : "❌ Failed"}
            style={{ width: "fit-content" }}
          />
          <a
            className="text-underline underline-text-on-hover"
            href={LINKS.REQUESTLY_EXTENSION_RULES_NOT_WORKING}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackTroubleshootClicked("test_this_rule__draft_session_modal");
            }}
          >
            Troubleshooting Guide
          </a>
        </Space>
      )}
      <SessionDetails key={tabId} />
      <ProductWalkthrough
        completeTourOnUnmount={false}
        startWalkthrough={!hasUserCreatedSessions && !isMiscTourCompleted?.firstDraftSession && !testRuleDraftSession}
        tourFor={MISC_TOURS.APP_ENGAGEMENT.FIRST_DRAFT_SESSION}
        onTourComplete={() =>
          dispatch(
            globalActions.updateProductTourCompleted({
              tour: TOUR_TYPES.MISCELLANEOUS,
              subTour: SUB_TOUR_TYPES.FIRST_DRAFT_SESSION,
            })
          )
        }
      />
    </div>
  );
};

export default DraftSessionViewer;
