import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system/components";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { SessionConfigPopup } from "features/sessionBook/components/SessionConfigPopup/SessionConfigPopup";
import DownArrow from "assets/icons/down-arrow.svg?react";
import { useLocation } from "react-router-dom";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { DebugInfo } from "features/sessionBook/types";
import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionFile";
import { downloadSessionFile } from "features/sessionBook/utils/sessionFile";
import {
  getSessionRecordingAttributes,
  getSessionRecordingEvents,
  getSessionRecordingMetaData,
  getTrimmedSessionData,
} from "store/features/session-recording/selectors";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import { SOURCE } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
import { useSaveDraftSession } from "features/sessionBook/screens/DraftSessionScreen/hooks/useSaveDraftSession";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { globalActions } from "store/slices/global/slice";
import { Conditional } from "components/common/Conditional";
import "./saveSessionButton.scss";

interface SaveSessionButtonProps {
  disabled?: boolean;
  onSaveClick?: () => void;
}

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

export const SaveSessionButton: React.FC<SaveSessionButtonProps> = ({ disabled, onSaveClick }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);

  const sessionEvents = useSelector(getSessionRecordingEvents);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionAttributes = useSelector(getSessionRecordingAttributes);
  const trimmedSessionData = useSelector(getTrimmedSessionData);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const isDraftSession = location.pathname.includes("draft");
  const isOpenedInIframe = useMemo(() => location.pathname.includes("iframe") && isAppOpenedInIframe(), [
    location.pathname,
  ]);
  const debugInfoToBeIncluded: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];
  const [isLoading, setIsLoading] = useState(false);

  const { saveDraftSession } = useSaveDraftSession();

  const handleSessionDownload = () => {
    const recordingOptions = getRecordingOptionsToSave(debugInfoToBeIncluded);
    const sessionEventsToDownload = trimmedSessionData?.events ?? sessionEvents;
    const attributes = { ...sessionAttributes, duration: trimmedSessionData?.duration ?? sessionAttributes?.duration };
    const metadata = { ...sessionRecordingMetadata, sessionAttributes: attributes };

    downloadSessionFile(sessionEventsToDownload, metadata, recordingOptions)
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
        globalActions.toggleActiveModal({
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
      [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS],
      isOpenedInIframe,
      SOURCE.SAVE_DRAFT_SESSION
    )
      .catch((err) => {
        Logger.log("Error while saving draft session", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [saveDraftSession, user?.loggedIn, dispatch, sessionRecordingMetadata, onSaveClick, isOpenedInIframe]);

  return (
    <div className="save-session-btn-container">
      <RQButton
        disabled={disabled}
        loading={isLoading}
        type="primary"
        className="save-session-btn"
        icon={<MdOutlineFileDownload />}
        onClick={isDraftSession ? handleSaveSession : handleSessionDownload}
      >
        {isDraftSession ? "Save" : "Download"}
      </RQButton>
      <RQButton
        disabled={disabled}
        type="primary"
        className="save-popup-button"
        onClick={() => setIsPopupVisible(true)}
      >
        <DownArrow />
      </RQButton>

      <Conditional condition={isPopupVisible && !disabled}>
        <SessionConfigPopup onClose={() => setIsPopupVisible(false)} onSaveClick={onSaveClick} />
      </Conditional>
    </div>
  );
};
