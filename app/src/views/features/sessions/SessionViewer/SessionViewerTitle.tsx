import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getSessionRecordingName, getSessionRecordingId } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { Typography, Input } from "antd";
import { BiPencil } from "react-icons/bi";
import { updateSessionName } from "../api";
import { toast } from "utils/Toast";
import { trackDraftSessionNamed } from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

interface SessionViewerTitleProps {
  isReadOnly?: boolean;
}

export const SessionViewerTitle: React.FC<SessionViewerTitleProps> = ({ isReadOnly = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const sessionRecordingName = useSelector(getSessionRecordingName);
  const recordingId = useSelector(getSessionRecordingId);
  const [isTitleEditable, setIsTitleEditable] = useState<boolean>(false);
  const [sessionTitle, setSessionTitle] = useState<string>(sessionRecordingName);

  const handleOnNameInputBlur = () => {
    setIsTitleEditable(false);
    if (recordingId) {
      if (sessionTitle.length && sessionTitle !== sessionRecordingName) {
        dispatch(sessionRecordingActions.setName(sessionTitle));
        updateSessionName(user?.details?.profile?.uid, recordingId, sessionTitle);
      } else {
        setSessionTitle(sessionRecordingName);
      }
    } else {
      if (!sessionTitle.length) setSessionTitle(sessionRecordingName);
      else dispatch(sessionRecordingActions.setName(sessionTitle));
      toast.success("Session name updated successfully");
      trackDraftSessionNamed();
    }
  };

  return (
    <div className="w-full">
      <div className="session-title-name">
        {isTitleEditable ? (
          <div className="session-title-name-wrapper">
            <Input
              autoFocus={true}
              onFocus={() => setIsTitleEditable(true)}
              onBlur={handleOnNameInputBlur}
              bordered={false}
              spellCheck={false}
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session name"
              onPressEnter={handleOnNameInputBlur}
            />
          </div>
        ) : (
          <div className="session-title">
            {isReadOnly ? (
              <Typography.Text ellipsis={true}>{sessionRecordingName}</Typography.Text>
            ) : (
              <>
                <Typography.Text ellipsis={true} onClick={() => setIsTitleEditable(true)}>
                  {sessionRecordingName ? sessionRecordingName : "Enter session name"}
                </Typography.Text>
                <BiPencil onClick={() => setIsTitleEditable(true)} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
