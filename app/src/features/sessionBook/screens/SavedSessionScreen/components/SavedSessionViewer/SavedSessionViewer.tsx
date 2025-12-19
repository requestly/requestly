import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import SessionViewerBottomSheet from "features/sessionBook/components/SessionViewerBottomSheet/SessionViewerBottomSheet";
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
import { useMediaQuery } from "react-responsive";
import { hideElement, showElement } from "utils/domUtils";
import StaticSessionViewerBottomSheet from "features/sessionBook/components/SessionViewerBottomSheet/StaticSessionViewerBottomSheet";
import "./savedSessionViewer.scss";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { useRBAC } from "features/rbac";
import { Conditional } from "components/common/Conditional";
import { copyToClipBoard } from "utils/Misc";
import { SheetLayout } from "componentsV2/BottomSheet/types";

interface NavigationState {
  fromApp?: boolean;
  viewAfterSave?: boolean;
}

export const SavedSessionViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "update");

  const { handleDeleteSessionAction } = useSessionsActionContext();
  const sessionMetadata = useSelector(getSessionRecordingMetaData);
  const currentVisibility = useSelector(getSessionRecordingVisibility);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);

  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sessionPlayerOffset, setSessionPlayerOffset] = useState(0);
  const currentSessionOffset = useRef(null);

  const isMobileView = useMediaQuery({ query: "(max-width: 768px)" });
  const bottomSheetLayoutBreakpoint = useMediaQuery({ query: "(max-width: 940px)" });

  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  const handleCopySessionLink = useCallback(async () => {
    const result = await copyToClipBoard(window.location.href);
    if (result.success) {
      setIsLinkCopied(true);
      setTimeout(() => {
        setIsLinkCopied(false);
      }, 1000);
    }
  }, []);

  const handleShareModalVisibiliity = useCallback(() => {
    trackSessionRecordingShareClicked();
    setIsShareModalVisible((prev) => !prev);
    currentSessionOffset.current = secToMinutesAndSeconds(sessionPlayerOffset);
  }, [sessionPlayerOffset]);

  const handleSessionPlayerTimeOffsetChange = useCallback((offset: number) => {
    setSessionPlayerOffset(offset);
  }, []);

  const handleDeleteSessionClick = useCallback(() => {
    handleDeleteSessionAction(id, sessionMetadata?.eventsFilePath, () => redirectToSessionRecordingHome(navigate));
  }, [handleDeleteSessionAction, id, navigate, sessionMetadata?.eventsFilePath]);

  useEffect(() => {
    if (isInsideIframe) {
      trackSavedSessionViewed("embed", id);
      return;
    }

    if ((location.state as NavigationState)?.fromApp) {
      trackSavedSessionViewed("app", id);
    } else {
      trackSavedSessionViewed("link", id);
    }
  }, [id, location.state, isInsideIframe]);

  useEffect(() => {
    if (isMobileView) {
      hideElement(".app-sidebar");
      hideElement(".app-header");
      hideElement(".app-footer");
    } else {
      showElement(".app-sidebar");
      showElement(".app-header");
      showElement(".app-footer");
    }
  }, [isMobileView]);

  return (
    <div className="saved-session-viewer-container">
      <BottomSheetProvider context="rules" defaultPlacement={BottomSheetPlacement.RIGHT}>
        <div className="saved-session-header">
          <SessionTitle />

          <Conditional condition={isValidPermission && isRequestedByOwner && !isInsideIframe}>
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
          </Conditional>
        </div>
        <BottomSheetLayout
          minSize={350}
          initialSizes={[58, 42]}
          hideBottomSheet={bottomSheetLayoutBreakpoint}
          bottomSheet={<SessionViewerBottomSheet playerTimeOffset={sessionPlayerOffset} />}
          layout={SheetLayout.SPLIT}
        >
          <div className="saved-session-viewer-body">
            <SessionPlayer onPlayerTimeOffsetChange={handleSessionPlayerTimeOffsetChange} />
            {bottomSheetLayoutBreakpoint && <StaticSessionViewerBottomSheet playerTimeOffset={sessionPlayerOffset} />}
          </div>
        </BottomSheetLayout>

        {isShareModalVisible ? (
          <ShareRecordingModal
            isVisible={isShareModalVisible}
            setVisible={handleShareModalVisibiliity}
            recordingId={id}
            currentVisibility={currentVisibility}
            currentOffset={currentSessionOffset.current}
          />
        ) : null}
      </BottomSheetProvider>
    </div>
  );
};
