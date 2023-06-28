import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getSessionRecordingName } from "store/features/session-recording/selectors";
import { Typography, Input } from "antd";
import { BiPencil } from "react-icons/bi";
import "./index.css";

export const SessionViewerTitle: React.FC = () => {
  const sessionRecordingName = useSelector(getSessionRecordingName);
  const [isTitleEditable, setIsTitleEditable] = useState<boolean>(false);
  const [sessionTitle, setSessionTitle] = useState<string>(sessionRecordingName);

  return (
    <div className="w-full">
      <div className="session-title-name">
        {sessionTitle.length === 0 || isTitleEditable ? (
          <div className="session-title-name-wrapper">
            <Input
              data-tour-id="rule-editor-title"
              autoFocus={true}
              onFocus={() => setIsTitleEditable(true)}
              onBlur={() => setIsTitleEditable(false)}
              bordered={false}
              spellCheck={false}
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
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
              {sessionTitle ? sessionTitle : "Enter session Title"}
            </Typography.Text>
            <BiPencil onClick={() => setIsTitleEditable(true)} />
          </div>
        )}
      </div>
    </div>
  );
};
