import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAttributes, getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { SessionConfigPopup } from "features/sessionBook/components/SessionConfigPopup/SessionConfigPopup";
import DownArrow from "assets/icons/down-arrow.svg?react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { DebugInfo } from "features/sessionBook/types";
import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionFile";
import { downloadSessionFile } from "features/sessionBook/utils/sessionFile";
import { getSessionRecordingEvents, getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import { SOURCE } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
import { saveDraftSession } from "features/sessionBook/screens/DraftSessionScreen/utils";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useIncentiveActions } from "features/incentivization/hooks";
import { actions } from "store";
import "./saveSessionButton.scss";

interface SaveSessionButtonProps {
  onSaveClick?: () => void;
}

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

export const SaveSessionButton: React.FC<SaveSessionButtonProps> = ({ onSaveClick }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const sessionEvents = useSelector(getSessionRecordingEvents);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const isDraftSession = location.pathname.includes("draft");
  const debugInfoToBeIncluded: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];
  const [isLoading, setIsLoading] = useState(false);

  const { claimIncentiveRewards } = useIncentiveActions();

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

  const handleSaveSession = useCallback(() => {
    if (!user?.loggedIn) {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: AUTH_ACTION_LABELS.SIGN_UP,
            src: window.location.href,
            eventSource: SOURCE.SAVE_DRAFT_SESSION,
          },
        })
      );
      return;
    }

    if (!sessionRecordingMetadata?.name) {
      toast.error("Name is required to save the recording.");
      return;
    }
    onSaveClick?.();

    setIsLoading(true);
    saveDraftSession(
      user,
      userAttributes,
      appMode,
      dispatch,
      navigate,
      workspace?.id,
      sessionRecordingMetadata,
      sessionEvents,
      [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS],
      SOURCE.SAVE_DRAFT_SESSION,
      claimIncentiveRewards
    )
      .catch((err) => {
        Logger.log("Error while saving draft session", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    user,
    userAttributes,
    appMode,
    dispatch,
    navigate,
    workspace?.id,
    sessionRecordingMetadata,
    sessionEvents,
    onSaveClick,
    claimIncentiveRewards,
  ]);

  return (
    <div className="save-session-btn-container">
      <RQButton
        loading={isLoading}
        type="primary"
        className="save-session-btn"
        icon={<MdOutlineFileDownload />}
        onClick={isDraftSession ? handleSaveSession : handleSessionDownload}
      >
        {isDraftSession ? "Save" : "Download"}
      </RQButton>
      <RQButton type="primary" className="save-popup-button" onClick={() => setIsPopupVisible(true)}>
        <DownArrow />
      </RQButton>
      {isPopupVisible && <SessionConfigPopup onClose={() => setIsPopupVisible(false)} onSaveClick={onSaveClick} />}
    </div>
  );
};
