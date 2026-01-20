import React, { useCallback } from "react";
import { RQSession } from "@requestly/web-sdk";
import { getTabSession } from "actions/ExtensionActions";
import { SessionRecordingMode } from "features/sessionBook/types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { isAppOpenedInIframe } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import usePreLoadRemover from "hooks/usePreLoadRemover";

export interface DraftSessionViewerProps {
  desktopMode?: boolean;
}

enum TabId {
  IMPORTED = "imported",
  MOCK = "mock",
  IFRAME = "iframe",
}

export const DraftSessionScreen: React.FC<DraftSessionViewerProps> = ({ desktopMode = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const metadata = useSelector(getSessionRecordingMetaData);
  const { isPreLoaderRemoved } = usePreLoadRemover();

  const tempTabId = useParams().tabId;
  const tabId = useMemo(() => (desktopMode ? TabId.IMPORTED : tempTabId), [desktopMode, tempTabId]);
  const isImportedSession = tabId === TabId.IMPORTED;

  const isOpenedInIframe = useMemo(() => location.pathname.includes("iframe") && isAppOpenedInIframe(), [
    location.pathname,
  ]);

  const populateSessionDataInStore = useCallback(
    (session: unknown) => {
      const tabSession = session as RQSession & { recordingMode?: SessionRecordingMode };
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
        dispatch(
          sessionRecordingActions.setTrimmedSessiondata({
            duration: tabSession.attributes?.duration,
            events: tabSession.events,
          })
        );
      }
    },
    [dispatch]
  );

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

    if (!desktopMode && !isOpenedInIframe) {
      // It is fired only if there was ANY interaction of the user with the site.
      // Without ANY interaction (even a click anywhere) event onbeforeunload won't be fired
      // https://stackoverflow.com/questions/24081699/why-onbeforeunload-event-is-not-firing
      window.addEventListener("beforeunload", unloadListener);

      return () => window.removeEventListener("beforeunload", unloadListener);
    }
  }, [desktopMode, isImportedSession, dispatch, isOpenedInIframe]);

  useEffect(() => {
    if (tabId === TabId.IFRAME) {
      dispatch(sessionRecordingActions.setTrimmedSessiondata(null));
      const handleViewDraftMessage = (event: any) => {
        if (event.data.action === "viewDraftSession") {
          setIsLoading(true);
          populateSessionDataInStore(event.data.payload);
          setIsLoading(false);
        }
      };

      const handleResetDraftMessage = (event: any) => {
        if (event.data.action === "resetDraftSessionViewer") {
          setIsLoading(true);
        }
      };

      window.addEventListener("message", handleViewDraftMessage);
      window.addEventListener("message", handleResetDraftMessage);

      return () => {
        window.removeEventListener("message", handleViewDraftMessage);
        window.removeEventListener("message", handleResetDraftMessage);
      };
    }
  }, [dispatch, tabId, populateSessionDataInStore]);

  useEffect(() => {
    if (isLoading && isPreLoaderRemoved) {
      if (tabId === TabId.IFRAME) return;

      if (tabId === TabId.IMPORTED) {
        setIsLoading(false);
      } else if (tabId === TabId.MOCK) {
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
        dispatch(sessionRecordingActions.setTrimmedSessiondata(null));
        getTabSession(parseInt(tabId))
          .then((payload: unknown) => {
            if (payload) {
              if (typeof payload === "string") {
                setLoadingError(payload);
              } else {
                populateSessionDataInStore(payload);
              }
              setIsLoading(false);
            }
          })
          .catch((error) => {
            Logger.log("Error while fetching tab session", error);
            toast.error("Error while fetching your recorded session");
            setIsLoading(false);
            setLoadingError("Something went wrong while fetching your recorded session");
          });
      }
    }
  }, [dispatch, tabId, populateSessionDataInStore, isLoading, isPreLoaderRemoved]);

  useEffect(() => {
    if (loadingError) {
      trackSessionRecordingFailed(loadingError);
    }
  }, [loadingError]);

  useEffect(() => {
    if (isOpenedInIframe) {
      window.parent.postMessage(
        {
          action: "draftSessionViewerLoaded",
          source: GLOBAL_CONSTANTS.CLIENT_SOURCE.SESSIONBEAR,
        },
        "*"
      );
    }
  }, [isOpenedInIframe]);

  if (isLoading) {
    return <PageLoader message="Loading draft session..." />;
  }

  if (loadingError) {
    <PageError error="Session Replay Loading Error" />;
  }

  return <DraftSessionViewer isDesktopMode={desktopMode} />;
};
