import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unstable_usePrompt, useNavigate, useParams, useLocation } from "react-router-dom";
import { getIsMiscTourCompleted, getUserAttributes } from "store/selectors";
import { getTabSession } from "actions/ExtensionActions";
import { StorageService } from "init";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSession, RQSessionAttributes, RQSessionEvents } from "@requestly/web-sdk";
import mockSession from "./mockData/mockSession";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import { decompressEvents, filterOutLargeNetworkResponses, generateDraftSessionTitle } from "./sessionEventsUtils";
import { cacheDraftSession, clearDraftSessionCache } from "./SessionViewerActions";
import PageLoader from "components/misc/PageLoader";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import PageError from "components/misc/PageError";
import SaveRecordingConfigPopup from "./SaveRecordingConfigPopup";
import { actions } from "store";
import PATHS from "config/constants/sub/paths";
import APP_CONSTANTS from "config/constants";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import {
  trackDraftSessionDiscarded,
  trackDraftSessionViewed,
  trackSessionRecordingFailed,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

const DraftSessionViewer: React.FC = () => {
  const { tabId } = useParams();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userAttributes = useSelector(getUserAttributes);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const isImportedSession = tabId === "imported";
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string>();
  const [isSavePopupVisible, setIsSavePopupVisible] = useState(false);
  const [isSaveSessionClicked, setIsSaveSessionClicked] = useState(false);

  const hasUserCreatedSessions = useMemo(
    () =>
      userAttributes?.num_sessions > 0 ||
      userAttributes?.num_sessions_saved_online > 0 ||
      userAttributes?.num_sessions_saved_offline > 0,
    [
      userAttributes?.num_sessions,
      userAttributes?.num_sessions_saved_online,
      userAttributes?.num_sessions_saved_offline,
    ]
  );

  const populateSessionData = useCallback(
    (attributes: RQSessionAttributes, events: RQSessionEvents, tabId?: string) => {
      dispatch(
        sessionRecordingActions.setSessionRecordingMetadata({
          sessionAttributes: attributes,
          name: tabId === "mock" ? "Mock session replay" : generateDraftSessionTitle(attributes?.url),
        })
      );
      filterOutLargeNetworkResponses(events);
      dispatch(sessionRecordingActions.setEvents(events));
    },
    [dispatch]
  );

  const getSavedDraftReplay = useCallback(() => {
    StorageService()
      .getRecord(APP_CONSTANTS.DRAFT_SESSIONS)
      .then((sessions) => {
        const session = sessions[tabId];
        const sessionEvents = decompressEvents(session.events);
        populateSessionData(session.metadata, sessionEvents);
      })
      .catch((error) => {
        setLoadingError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tabId, populateSessionData]);

  const getNewDraftReplay = useCallback(() => {
    getTabSession(parseInt(tabId))
      .then((payload) => {
        if (typeof payload === "string") {
          setLoadingError(payload);
        } else {
          const tabSession = payload as RQSession;

          if (tabSession.events.rrweb?.length < 2) {
            setLoadingError("RRWeb events not captured");
          } else {
            populateSessionData(tabSession.attributes, tabSession.events);
            cacheDraftSession(tabSession.attributes, tabSession.events, tabId);
          }
        }
      })
      .catch((error) => {
        setLoadingError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tabId, populateSessionData]);

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
    when: !isSaveSessionClicked,
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
    setIsLoading(true);

    if (tabId === "imported") {
      setIsLoading(false);
    } else if (tabId === "mock") {
      populateSessionData(mockSession.attributes, mockSession.events, tabId);
      setIsLoading(false);
    } else if (queryParams.has("savedDraft")) {
      getSavedDraftReplay();
    } else {
      getNewDraftReplay();
    }
  }, [dispatch, tabId, queryParams, getSavedDraftReplay, getNewDraftReplay, populateSessionData]);

  const confirmDiscard = () => {
    Modal.confirm({
      title: "Confirm Discard",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to discard this draft recording?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await clearDraftSessionCache(tabId);
        trackDraftSessionDiscarded();
        navigate(PATHS.SESSIONS.ABSOLUTE);
      },
    });
  };

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
      <div className="session-viewer-header">
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
            />
          )}
        </div>
      </div>
      <SessionDetails key={tabId} />
      <ProductWalkthrough
        completeTourOnUnmount={false}
        startWalkthrough={!hasUserCreatedSessions && !isMiscTourCompleted?.firstDraftSession}
        tourFor={MISC_TOURS.APP_ENGAGEMENT.FIRST_DRAFT_SESSION}
        onTourComplete={() =>
          dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "firstDraftSession" }))
        }
      />
    </div>
  );
};

export default DraftSessionViewer;
