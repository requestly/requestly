import ProCard from "@ant-design/pro-card";
import { Button, InputNumber, Typography, Input } from "antd";
import React, { ReactNode, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getIsReadOnly,
  getSessionRecordingAttributes,
  getSessionRecordingDescription,
  getSessionRecordingEvents,
  getSessionRecordingId,
  getSessionRecordingStartTimeOffset,
} from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { updateStartTimeOffset, updateDescription } from "../api";
import {
  epochToDateAndTimeString,
  msToHoursMinutesAndSeconds,
} from "utils/DateTimeUtils";
import debounce from "lodash/debounce";
import { AimOutlined } from "@ant-design/icons";
import InfoIcon from "components/misc/InfoIcon";
import { getUserAuthDetails } from "store/selectors";

const SessionProperty: React.FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => {
  return children ? (
    <div
      style={{
        marginBottom: 16,
        fontSize: 13,
        wordBreak: "break-all",
      }}
    >
      <Typography.Text type="secondary">
        <div className="session-property-label">{label}:</div>
        <div>{children}</div>
      </Typography.Text>
    </div>
  ) : null;
};

interface Props {
  getCurrentTimeOffset: () => number;
}

const SessionPropertiesPanel: React.FC<Props> = ({ getCurrentTimeOffset }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const recordingId = useSelector(getSessionRecordingId);
  const attributes = useSelector(getSessionRecordingAttributes);
  const events = useSelector(getSessionRecordingEvents);
  const startTimeOffset = useSelector(getSessionRecordingStartTimeOffset);
  const isReadOnly = useSelector(getIsReadOnly);
  const sessionDescription = useSelector(getSessionRecordingDescription);

  const recordingLengthInSeconds = useMemo(
    () => Math.floor(attributes.duration / 1000),
    [attributes]
  );

  const saveStartTimeOffset = useMemo(
    () =>
      debounce((value: number) => {
        if (recordingId) {
          updateStartTimeOffset(
            user?.details?.profile?.uid,
            recordingId,
            value
          );
        }
      }, 1000),
    [recordingId, user]
  );

  const onStartTimeOffsetChange = useCallback(
    (newOffset: number) => {
      saveStartTimeOffset(newOffset);
      dispatch(sessionRecordingActions.setStartTimeOffset(newOffset));
    },
    [dispatch, saveStartTimeOffset]
  );

  const saveDescription = useCallback(
    (value: string) => {
      if (recordingId) {
        updateDescription(user?.details?.profile?.uid, recordingId, value);
      }
    },
    [recordingId, user]
  );

  const onDescriptionChange = useCallback(
    (description: string) => {
      dispatch(sessionRecordingActions.setDescription(description));
    },
    [dispatch]
  );

  return (
    <ProCard className="session-recording-properties primary-card">
      {attributes.startTime && (
        <SessionProperty label="Recorded at">
          {epochToDateAndTimeString(attributes.startTime)}
        </SessionProperty>
      )}
      {events.rrweb.length && (
        <SessionProperty label="Duration">
          {msToHoursMinutesAndSeconds(attributes.duration)}
        </SessionProperty>
      )}
      {!isReadOnly && (
        <SessionProperty label="Start time offset">
          <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
            <InputNumber
              addonAfter="seconds"
              min={0}
              max={recordingLengthInSeconds}
              value={startTimeOffset}
              onChange={onStartTimeOffsetChange}
              style={{ marginTop: 5, width: 200 }}
              size="small"
            />
            <InfoIcon
              text={`By default, video will start playing at this time.`}
            />
          </div>
          <div>
            <Button
              type="link"
              icon={<AimOutlined />}
              onClick={() => onStartTimeOffsetChange(getCurrentTimeOffset())}
            >
              Select current player time
            </Button>
          </div>
        </SessionProperty>
      )}
      <SessionProperty label="Description">
        {!isReadOnly ? (
          <Input.TextArea
            rows={7}
            placeholder={"Add a description for the recording"}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onBlur={(e) => saveDescription(e.target.value)}
            value={sessionDescription}
            style={{ wordBreak: "break-word", resize: "none" }}
          />
        ) : (
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {sessionDescription}
          </span>
        )}
      </SessionProperty>
    </ProCard>
  );
};

export default React.memo(SessionPropertiesPanel);
