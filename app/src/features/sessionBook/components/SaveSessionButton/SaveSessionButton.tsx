import { useState } from "react";
import { useSelector } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { SessionConfigPopup } from "features/sessionBook/screens/SavedSessionScreen/components/SessionConfigPopup/SessionConfigPopup";
import DownArrow from "assets/icons/down-arrow.svg?react";
import { useLocation } from "react-router-dom";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { DebugInfo } from "features/sessionBook/types";
import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionEvents";
import { downloadSessionFile } from "features/sessionBook/utils/sessionFile";
import { getSessionRecordingEvents, getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import "./saveSessionButton.scss";

export const SaveSessionButton = () => {
  const location = useLocation();

  const sessionEvents = useSelector(getSessionRecordingEvents);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const isDraftSession = location.pathname.includes("draft");
  const debugInfoToBeIncluded: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];

  const handleSessionDownload = () => {
    const recordingOptions = getRecordingOptionsToSave(debugInfoToBeIncluded);
    downloadSessionFile(sessionEvents, sessionRecordingMetadata, recordingOptions)
      .then(() => {
        toast.success("Session downloaded successfully");
      })
      .catch((error) => {
        toast.error("Failed to download the session");
        Logger.error("Failed to download the session", error);
      });
  };

  return (
    <div className="save-session-btn-container">
      <RQButton
        type="primary"
        className="save-session-btn"
        icon={<MdOutlineFileDownload />}
        onClick={handleSessionDownload}
      >
        {isDraftSession ? "Save" : "Download"}
      </RQButton>
      <RQButton type="primary" className="save-popup-button" onClick={() => setIsPopupVisible(true)}>
        <DownArrow />
      </RQButton>
      {isPopupVisible && <SessionConfigPopup onClose={() => setIsPopupVisible(false)} />}
    </div>
  );
};
