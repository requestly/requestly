import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Tooltip } from "antd";
import { getAuthInitialization, getUserAuthDetails } from "store/selectors";
import { SessionTitle } from "../components/SessionsTitle/SessionTitle";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlinePublic } from "@react-icons/all-files/md/MdOutlinePublic";
import { MdOutlineLink } from "@react-icons/all-files/md/MdOutlineLink";
import { DownloadSessionButton } from "../components/DownloadSessionButton/DownloadSessionButton";
import { BottomSheetLayout, BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { SessionPlayer } from "../components/SessionPlayer/SessionPlayer";
import { getRecording } from "backend/sessionRecording/getRecording";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { RQSessionEvents } from "@requestly/web-sdk";
import { decompressEvents } from "views/features/sessions/SessionViewer/sessionEventsUtils";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import "./savedSessionViewer.scss";
import PageLoader from "components/misc/PageLoader";

export const SavedSessionViewer: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const [isFetching, setIsFetching] = useState(false);

  const hasAuthInitialized = useSelector(getAuthInitialization);

  useEffect(() => {
    if (!hasAuthInitialized) return;

    setIsFetching(true);

    getRecording(id, user?.details?.profile?.uid, workspace?.id, user?.details?.profile?.email)
      .then((res) => {
        // setShowPermissionError(false);
        dispatch(sessionRecordingActions.setSessionRecordingMetadata({ id, ...res.payload }));
        try {
          const recordedSessionEvents: RQSessionEvents = decompressEvents(res.events);
          dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
        } catch (e) {
          const err = new Error("Failed to decompress session events");
          err.name = "BadSessionEvents";
          throw err;
        } finally {
          setIsFetching(false);
        }
      })
      .catch((err) => {
        switch (err.name) {
          case "NotFound":
            // setShowNotFoundError(true);
            break;
          case "BadSessionEvents":
            // setShowBadSessionError(true);
            break;
          case "PermissionDenied":
          default:
          // setShowPermissionError(true);
        }
      });
  }, [dispatch, hasAuthInitialized, id, user?.details?.profile?.uid, user?.details?.profile?.email, workspace?.id]);

  if (isFetching) {
    return <PageLoader message="Fetching session details..." />;
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.RIGHT}>
      <div className="saved-session-viewer-container">
        <div className="saved-session-header">
          <SessionTitle />
          <div className="saved-session-actions">
            <Tooltip title="Delete session">
              <RQButton className="delete-session-btn" iconOnly icon={<RiDeleteBin6Line />} />
            </Tooltip>
            <RQButton className="share-session-btn" icon={<MdOutlinePublic />}>
              Share session
            </RQButton>
            <RQButton className="share-session-btn" icon={<MdOutlineLink />}>
              Copy link
            </RQButton>
            <DownloadSessionButton />
          </div>
        </div>
        <BottomSheetLayout bottomSheet={<>SHEET</>}>
          <div className="saved-session-viewer-body">
            <SessionPlayer />
          </div>
        </BottomSheetLayout>
      </div>
    </BottomSheetProvider>
  );
};
