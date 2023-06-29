import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getSessionRecordingName, getSessionRecordingId } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { Typography, Input } from "antd";
import { BiPencil } from "react-icons/bi";
import "./sessionViewer.scss";
import { updateSessionName } from "../api";

export const SessionViewerTitle: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const sessionRecordingName = useSelector(getSessionRecordingName);
  const recordingId = useSelector(getSessionRecordingId);
  const [isTitleEditable, setIsTitleEditable] = useState<boolean>(false);

  const handleOnNameInputBlur = () => {
    setIsTitleEditable(false);
    if (recordingId) {
      updateSessionName(user?.details?.profile?.uid, recordingId, sessionRecordingName);
    }
  };

  return (
    <div className="w-full">
      <div className="session-title-name">
        {sessionRecordingName?.length === 0 || isTitleEditable ? (
          <div className="session-title-name-wrapper">
            <Input
              autoFocus={true}
              onFocus={() => setIsTitleEditable(true)}
              onBlur={handleOnNameInputBlur}
              bordered={false}
              spellCheck={false}
              value={sessionRecordingName}
              onChange={(e) => dispatch(sessionRecordingActions.setName(e.target.value))}
              placeholder="Enter session Title"
              onPressEnter={handleOnNameInputBlur}
            />
          </div>
        ) : (
          <div className="session-title">
            <Typography.Text
              ellipsis={true}
              onClick={() => {
                setIsTitleEditable(true);
              }}
            >
              {sessionRecordingName ? sessionRecordingName : "Enter session Title"}
            </Typography.Text>
            <BiPencil onClick={() => setIsTitleEditable(true)} />
          </div>
        )}
      </div>
    </div>
  );
};
