import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unstable_usePrompt, useNavigate, useParams } from "react-router-dom";
import { getIsMiscTourCompleted, getUserAttributes, getUserAuthDetails } from "store/selectors";
import { getTabSession } from "actions/ExtensionActions";
import { Input, Modal, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSession } from "@requestly/web-sdk";
import mockSession from "./mockData/mockSession";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import { filterOutLargeNetworkResponses } from "./sessionEventsUtils";
import PageLoader from "components/misc/PageLoader";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import PageError from "components/misc/PageError";
import SaveRecordingConfigPopup from "./SaveRecordingConfigPopup";
import { actions } from "store";
import PATHS from "config/constants/sub/paths";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import {
  trackDraftSessionDiscarded,
  trackDraftSessionViewed,
  trackSessionRecordingFailed,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";
import LINKS from "config/constants/sub/links";
import { trackTestRuleSessionDraftSaved, trackTroubleshootClicked } from "modules/analytics/events/features/ruleEditor";

export interface DraftSessionViewerProps {
  testRuleDraftSession?: {
    draftSessionTabId: string;
    testReportId: string;
    closeModal: () => void;
    appliedRuleStatus: boolean;
  };
}

const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({ testRuleDraftSession }) => {
  const tabId = useParams().tabId ?? testRuleDraftSession.draftSessionTabId;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const isImportedSession = tabId === "imported";
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string>();
  const [isSavePopupVisible, setIsSavePopupVisible] = useState(false);
  const [isSaveSessionClicked, setIsSaveSessionClicked] = useState(false);
  const [isDiscardSessionClicked, setIsDiscardSessionClicked] = useState(false);

  const generateDraftSessionTitle = useCallback((url: string) => {
    const hostname = new URL(url).hostname.split(".").slice(0, -1).join(".");
    const date = new Date();
    const month = date.toLocaleString("default", { month: "short" });
    const formattedDate = `${date.getDate()}${month}${date.getFullYear()}`;
    return `${hostname}@${formattedDate}`;
  }, []);

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

    // It is fired only if there was ANY interaction of the user with the site.
    // Without ANY interaction (even a click anywhere) event onbeforeunload won't be fired
    // https://stackoverflow.com/questions/24081699/why-onbeforeunload-event-is-not-firing
    window.addEventListener("beforeunload", unloadListener);

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, []);

  unstable_usePrompt({
    when: !isSaveSessionClicked && !isDiscardSessionClicked && !testRuleDraftSession,
    message: "Exiting without saving will discard the draft.\nAre you sure you want to exit?",
  });

  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if (isImportedSession && sessionRecordingMetadata === null) {
      navigate(PATHS.SESSIONS.ABSOLUTE);
    }
  }, [navigate, isImportedSession, sessionRecordingMetadata]);

  useEffect(() => {
    trackDraftSessionViewed();

    if (testRuleDraftSession) {
      trackTestRuleSessionDraftSaved();
    }

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
          const tabSession = payload as RQSession;
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
              })
            );

            filterOutLargeNetworkResponses(tabSession.events);
            dispatch(sessionRecordingActions.setEvents(tabSession.events));
          }
        }
        setIsLoading(false);
      });
    }
  }, [dispatch, tabId, user?.details?.profile?.email, generateDraftSessionTitle, testRuleDraftSession]);

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
          <RQButton type="default" onClick={confirmDiscard}>
            Discard
          </RQButton>
          <RQButton
            data-tour-id="save-draft-session-btn"
            type="primary"
            className="text-bold session-viewer-save-action-btn"
            onClick={() => {
              setIsSavePopupVisible((prev) => !prev);
              dispatch(
                actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "firstDraftSession" })
              );
            }}
          >
            Save <DownArrow />
          </RQButton>

          {isSavePopupVisible && (
            <SaveRecordingConfigPopup
              onClose={() => setIsSavePopupVisible(false)}
              setIsSaveSessionClicked={setIsSaveSessionClicked}
              testRuleDraftSession={testRuleDraftSession}
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
            className="external-link"
            href={LINKS.REQUESTLY_EXTENSION_RULES_NOT_WORKING}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackTroubleshootClicked("test_this_rule__draft_session_modal");
            }}
          >
            Troubleshooting guide
          </a>
        </Space>
      )}
      <SessionDetails key={tabId} />
      <ProductWalkthrough
        completeTourOnUnmount={false}
        startWalkthrough={!hasUserCreatedSessions && !isMiscTourCompleted?.firstDraftSession && !testRuleDraftSession}
        tourFor={MISC_TOURS.APP_ENGAGEMENT.FIRST_DRAFT_SESSION}
        onTourComplete={() =>
          dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "firstDraftSession" }))
        }
      />
    </div>
  );
};

export default DraftSessionViewer;
