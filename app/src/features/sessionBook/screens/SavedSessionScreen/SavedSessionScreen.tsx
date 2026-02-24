import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAuthInitialization } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getRecording } from "backend/sessionRecording/getRecording";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { RQSessionEvents } from "@requestly/web-sdk";
import { decompressEvents } from "views/features/sessions/SessionViewer/sessionEventsUtils";
import PageLoader from "components/misc/PageLoader";
import { SavedSessionViewer } from "./components/SavedSessionViewer/SavedSessionViewer";
import PermissionError from "features/sessionBook/components/PermissionError";
import BadSessionError from "features/sessionBook/components/BadSessionError";
import NotFoundError from "features/sessionBook/components/NotFoundError";
import { isAppOpenedInIframe } from "utils/AppUtils";
import "./savedSessionScreen.scss";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

enum SessionError {
  PermissionDenied = "PermissionDenied",
  NotFound = "NotFound",
  BadSessionEvents = "BadSessionEvents",
}

export const SavedSessionScreen: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId) ?? null;
  const [isFetching, setIsFetching] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [showNotFoundError, setShowNotFoundError] = useState(false);
  const [showBadSessionError, setShowBadSessionError] = useState(false);

  const hasAuthInitialized = useSelector(getAuthInitialization);

  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  useEffect(() => {
    if (!hasAuthInitialized) return;

    setIsFetching(true);

    getRecording(id, user?.details?.profile?.uid, activeWorkspaceId, user?.details?.profile?.email)
      .then((res) => {
        setShowPermissionError(false);
        dispatch(sessionRecordingActions.setSessionRecordingMetadata({ id, ...res.payload }));
        try {
          const recordedSessionEvents: RQSessionEvents = decompressEvents(res.events);
          dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
        } catch (e) {
          const err = new Error("Failed to decompress session events");
          err.name = SessionError.BadSessionEvents;
          throw err;
        } finally {
          setIsFetching(false);
        }
      })
      .catch((err) => {
        switch (err.name) {
          case SessionError.NotFound:
            setShowNotFoundError(true);
            break;
          case SessionError.BadSessionEvents:
            setShowBadSessionError(true);
            break;
          case SessionError.PermissionDenied:
          default:
            setShowPermissionError(true);
        }
      });
  }, [dispatch, hasAuthInitialized, id, user?.details?.profile?.uid, user?.details?.profile?.email, activeWorkspaceId]);

  if (showPermissionError) return <PermissionError isInsideIframe={isInsideIframe} />;
  if (showBadSessionError) return <BadSessionError />;
  if (showNotFoundError) return <NotFoundError />;

  if (isFetching) {
    return <PageLoader message="Fetching session details..." />;
  }

  return <SavedSessionViewer />;
};
