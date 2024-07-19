import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Tooltip } from "antd";
import { BottomSheetLayout, BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { SaveSessionButton } from "features/sessionBook/components/SaveSessionButton/SaveSessionButton";
import { SessionPlayer } from "features/sessionBook/components/SessionPlayer/SessionPlayer";
import { SessionTitle } from "features/sessionBook/screens/SavedSessionScreen/components/SessionsTitle/SessionTitle";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlinePublic } from "@react-icons/all-files/md/MdOutlinePublic";
import { MdOutlineLink } from "@react-icons/all-files/md/MdOutlineLink";
import SessionViewerBottomSheet from "features/sessionBook/screens/SavedSessionScreen/components/SessionViewerBottomSheet/SessionViewerBottomSheet";
import { useSessionsActionContext } from "features/sessionBook/context/actions";
import {
  getIsRequestedByOwner,
  getSessionRecordingMetaData,
  getSessionRecordingVisibility,
} from "store/features/session-recording/selectors";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import ShareRecordingModal from "views/features/sessions/ShareRecordingModal";
import { trackSavedSessionViewed, trackSessionRecordingShareClicked } from "features/sessionBook/analytics";
import { isAppOpenedInIframe } from "utils/AppUtils";
import "./savedSessionViewer.scss";

interface NavigationState {
  fromApp?: boolean;
  viewAfterSave?: boolean;
}

export const SavedSessionViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { handleDeleteSessionAction } = useSessionsActionContext();
  const sessionMetadata = useSelector(getSessionRecordingMetaData);
  const currentVisibility = useSelector(getSessionRecordingVisibility);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);

  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sessionPlayerOffset, setSessionPlayerOffset] = useState(0);

  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  const handleCopySessionLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 1000);
  }, []);

  const handleShareModalVisibiliity = useCallback(() => {
    trackSessionRecordingShareClicked();
    setIsShareModalVisible((prev) => !prev);
  }, []);

  const handleSessionPlayerTimeOffsetChange = useCallback((offset: number) => {
    setSessionPlayerOffset(offset);
  }, []);

  const handleDeleteSessionClick = useCallback(() => {
    handleDeleteSessionAction(id, sessionMetadata?.eventsFilePath, () => redirectToSessionRecordingHome(navigate));
  }, [handleDeleteSessionAction, id, navigate, sessionMetadata?.eventsFilePath]);

  useEffect(() => {
    if (isInsideIframe) {
      trackSavedSessionViewed("embed");
      return;
    }

    if ((location.state as NavigationState)?.fromApp) {
      trackSavedSessionViewed("app");
    } else {
      trackSavedSessionViewed("link");
    }
  }, [id, location.state, isInsideIframe]);

  return (
    <div className="saved-session-viewer-container">
      <BottomSheetProvider defaultPlacement={BottomSheetPlacement.RIGHT}>
        <div className="saved-session-header">
          <SessionTitle />
          {isRequestedByOwner ? (
            <div className="saved-session-actions">
              <Tooltip title="Delete session">
                <RQButton
                  onClick={handleDeleteSessionClick}
                  className="delete-session-btn"
                  iconOnly
                  icon={<RiDeleteBin6Line />}
                />
              </Tooltip>
              <RQButton className="share-session-btn" icon={<MdOutlinePublic />} onClick={handleShareModalVisibiliity}>
                Share session
              </RQButton>
              <RQButton className="share-session-btn" icon={<MdOutlineLink />} onClick={handleCopySessionLink}>
                {isLinkCopied ? "Copied!" : "Copy Link"}
              </RQButton>
              <SaveSessionButton />
            </div>
          ) : null}
        </div>
        <BottomSheetLayout bottomSheet={<SessionViewerBottomSheet playerTimeOffset={sessionPlayerOffset} />}>
          <div className="saved-session-viewer-body">
            <SessionPlayer onPlayerTimeOffsetChange={handleSessionPlayerTimeOffsetChange} />
          </div>
        </BottomSheetLayout>

        {isShareModalVisible ? (
          <ShareRecordingModal
            isVisible={isShareModalVisible}
            setVisible={handleShareModalVisibiliity}
            recordingId={id}
            currentVisibility={currentVisibility}
          />
        ) : null}
      </BottomSheetProvider>
    </div>
  );
};
