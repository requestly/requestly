import { Tooltip } from "antd";
import { BottomSheetLayout, BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { DownloadSessionButton } from "features/sessionsV2/components/DownloadSessionButton/DownloadSessionButton";
import { SessionPlayer } from "features/sessionsV2/components/SessionPlayer/SessionPlayer";
import { SessionTitle } from "features/sessionsV2/components/SessionsTitle/SessionTitle";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlinePublic } from "@react-icons/all-files/md/MdOutlinePublic";
import { MdOutlineLink } from "@react-icons/all-files/md/MdOutlineLink";
import "./savedSessionViewer.scss";

export const SavedSessionViewer = () => {
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
        <BottomSheetLayout bottomSheet={<>SESSION DETAILS HERE</>}>
          <div className="saved-session-viewer-body">
            <SessionPlayer />
          </div>
        </BottomSheetLayout>
      </div>
    </BottomSheetProvider>
  );
};
