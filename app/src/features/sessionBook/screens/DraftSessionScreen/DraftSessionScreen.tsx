import React from "react";
import { RQSession } from "@requestly/web-sdk";
import { getTabSession } from "actions/ExtensionActions";
import { SessionRecordingMode } from "features/sessionBook/types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { generateDraftSessionTitle } from "./utils";
import mockSession from "views/features/sessions/SessionViewer/mockData/mockSession";
import { trackSessionRecordingFailed } from "features/sessionBook/analytics";
import PageLoader from "components/misc/PageLoader";
import PageError from "components/misc/PageError";
import { DraftSessionViewer } from "./components/DraftSessionViewer/DraftSessionViewer";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import PATHS from "config/constants/sub/paths";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";

export interface DraftSessionViewerProps {
  desktopMode?: boolean;
}

export const DraftSessionScreen: React.FC<DraftSessionViewerProps> = ({ desktopMode = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const metadata = useSelector(getSessionRecordingMetaData);

  const tempTabId = useParams().tabId;
  const tabId = useMemo(() => (desktopMode ? "imported" : tempTabId), [desktopMode, tempTabId]);
  const isImportedSession = tabId === "imported";

  useEffect(() => {
    if (isImportedSession && metadata === null && !desktopMode) {
      navigate(PATHS.SESSIONS.ABSOLUTE);
    }
  }, [navigate, isImportedSession, metadata, desktopMode]);

  useEffect(() => {
    const unloadListener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Exiting without saving will discard the draft.\nAre you sure you want to exit?";
    };
    if (!isImportedSession) dispatch(sessionRecordingActions.resetState());

    if (!desktopMode) {
      // It is fired only if there was ANY interaction of the user with the site.
      // Without ANY interaction (even a click anywhere) event onbeforeunload won't be fired
      // https://stackoverflow.com/questions/24081699/why-onbeforeunload-event-is-not-firing
      window.addEventListener("beforeunload", unloadListener);

      return () => window.removeEventListener("beforeunload", unloadListener);
    }
  }, [desktopMode, isImportedSession, dispatch]);

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
      getTabSession(parseInt(tabId))
        .then((payload: unknown) => {
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
        })
        .catch((error) => {
          Logger.log("Error while fetching tab session", error);
          toast.error("Error while fetching your recorded session");
          setIsLoading(false);
          setLoadingError("Something went wrong while fetching your recorded session");
        });
    }
  }, [dispatch, tabId]);

  useEffect(() => {
    if (loadingError) {
      trackSessionRecordingFailed(loadingError);
    }
  }, [loadingError]);

  if (isLoading) {
    return <PageLoader message="Loading draft session..." />;
  }

  if (loadingError) {
    <PageError error="Session Replay Loading Error" />;
  }

  return <DraftSessionViewer isDesktopMode={desktopMode} />;
};
