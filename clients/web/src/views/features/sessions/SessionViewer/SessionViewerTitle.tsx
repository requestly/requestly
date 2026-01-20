import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getSessionRecordingName, getSessionRecordingId } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { Typography, Input, Row, Tooltip } from "antd";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import { updateSessionName } from "../api";
//@ts-ignore
import CopyToClipboard from "react-copy-to-clipboard";
import ExportOutlined from "assets/icons/export-outlined.svg?react";
import {
  trackDraftSessionNamed,
  trackSavedSessionViewed,
  trackSessionRecordingShareLinkCopied,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";
import { CopyOutlined } from "@ant-design/icons";

interface SessionViewerTitleProps {
  isReadOnly?: boolean;
  isInsideIframe?: boolean;
}

export const SessionViewerTitle: React.FC<SessionViewerTitleProps> = ({
  isReadOnly = false,
  isInsideIframe = false,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const sessionRecordingName = useSelector(getSessionRecordingName);
  const recordingId = useSelector(getSessionRecordingId);
  const [isTitleEditable, setIsTitleEditable] = useState<boolean>(false);
  const [sessionTitle, setSessionTitle] = useState<string>(sessionRecordingName);
  const [sessionLinkCopyText, setSessionLinkCopyText] = useState<string>("Copy session link");

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
          <div className={`session-title ${isInsideIframe ? "inside-iframe" : ""}`}>
            {isReadOnly ? (
              <Row align="middle" className="w-full" wrap={false} justify="space-between">
                <div>
                  <Typography.Text ellipsis={true}>{sessionRecordingName}</Typography.Text>
                  {isInsideIframe && (
                    <Tooltip title="View Session" placement="right">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${window.location.origin}/sessions/saved/${recordingId}`}
                        style={{ fontSize: "14px", display: "inline-flex", alignItems: "center", marginLeft: "8px" }}
                        onClick={() => trackSavedSessionViewed("embed")}
                      >
                        <ExportOutlined />
                      </a>
                    </Tooltip>
                  )}
                </div>
                {isInsideIframe && (
                  <div className="ml-left">
                    <CopyToClipboard text={`${window.location.origin}/sessions/saved/${recordingId}`}>
                      <Tooltip title={sessionLinkCopyText} placement="left">
                        <CopyOutlined
                          style={{
                            color:
                              sessionLinkCopyText === "Link copied"
                                ? "var(--requestly-color-success)"
                                : "var(--requestly-color-text-default)",
                          }}
                          onClick={() => {
                            setSessionLinkCopyText("Link copied");
                            trackSessionRecordingShareLinkCopied("embed");
                            setTimeout(() => {
                              setSessionLinkCopyText("Copy session link");
                            }, 1000);
                          }}
                        />
                      </Tooltip>
                    </CopyToClipboard>
                  </div>
                )}
              </Row>
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
