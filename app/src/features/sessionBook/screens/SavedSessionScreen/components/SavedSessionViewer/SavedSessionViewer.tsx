import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Tooltip } from "antd";
import { BottomSheetLayout, BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { DownloadSessionButton } from "features/sessionBook/components/DownloadSessionButton/DownloadSessionButton";
import { SessionPlayer } from "features/sessionBook/components/SessionPlayer/SessionPlayer";
import { SessionTitle } from "features/sessionBook/screens/SavedSessionScreen/components/SessionsTitle/SessionTitle";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlinePublic } from "@react-icons/all-files/md/MdOutlinePublic";
import { MdOutlineLink } from "@react-icons/all-files/md/MdOutlineLink";
import { SessionViewerBottomSheet } from "features/sessionBook/screens/SavedSessionScreen/components/SessionViewerBottomSheet/SessionViewerBottomSheet";
import { useSessionsActionContext } from "features/sessionBook/context/actions";
import { getSessionRecordingMetaData, getSessionRecordingVisibility } from "store/features/session-recording/selectors";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import ShareRecordingModal from "views/features/sessions/ShareRecordingModal";
import "./savedSessionViewer.scss";

export const SavedSessionViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { handleDeleteSessionAction } = useSessionsActionContext();
  const sessionMetadata = useSelector(getSessionRecordingMetaData);
  const currentVisibility = useSelector(getSessionRecordingVisibility);

  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const handleCopySessionLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 1000);
  };

  const handleShareModalVisibiliity = () => {
    // TODO: ADD ANALYTICS
    setIsShareModalVisible((prev) => !prev);
  };

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.RIGHT}>
      <div className="saved-session-viewer-container">
        <div className="saved-session-header">
          <SessionTitle />
          <div className="saved-session-actions">
            <Tooltip title="Delete session">
              <RQButton
                onClick={() =>
                  handleDeleteSessionAction(id, sessionMetadata?.eventsFilePath, () =>
                    redirectToSessionRecordingHome(navigate)
                  )
                }
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
            <DownloadSessionButton />
          </div>
        </div>
        <BottomSheetLayout bottomSheet={<SessionViewerBottomSheet />}>
          <div className="saved-session-viewer-body">
            <SessionPlayer />
          </div>
        </BottomSheetLayout>
      </div>

      {isShareModalVisible ? (
        <ShareRecordingModal
          isVisible={isShareModalVisible}
          setVisible={handleShareModalVisibiliity}
          recordingId={id}
          currentVisibility={currentVisibility}
        />
      ) : null}
    </BottomSheetProvider>
  );
};
