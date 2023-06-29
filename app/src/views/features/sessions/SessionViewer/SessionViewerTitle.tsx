import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSessionRecordingName } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { Typography, Input } from "antd";
import { BiPencil } from "react-icons/bi";
import "./sessionViewer.scss";

export const SessionViewerTitle: React.FC = () => {
  const dispatch = useDispatch();
  const sessionRecordingName = useSelector(getSessionRecordingName);
  const [isTitleEditable, setIsTitleEditable] = useState<boolean>(false);

  return (
    <div className="w-full">
      <div className="session-title-name">
        {sessionRecordingName?.length === 0 || isTitleEditable ? (
          <div className="session-title-name-wrapper">
            <Input
              data-tour-id="rule-editor-title"
              autoFocus={true}
              onFocus={() => setIsTitleEditable(true)}
              onBlur={() => setIsTitleEditable(false)}
              bordered={false}
              spellCheck={false}
              value={sessionRecordingName}
              onChange={(e) => dispatch(sessionRecordingActions.setName(e.target.value))}
              placeholder="Enter session Title"
              onPressEnter={() => setIsTitleEditable(false)}
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
