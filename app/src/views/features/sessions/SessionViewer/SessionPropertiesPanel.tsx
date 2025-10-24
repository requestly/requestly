import React, { useCallback, useMemo, useRef, useState } from "react";
import ProCard from "@ant-design/pro-card";
import { InputNumber, Input, Tooltip } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import {
  getIsReadOnly,
  getSessionRecordingAttributes,
  getSessionRecordingDescription,
  getSessionRecordingId,
  getSessionRecordingStartTimeOffset,
} from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { updateStartTimeOffset, updateDescription } from "../api";
import debounce from "lodash/debounce";

interface Props {
  getCurrentTimeOffset: () => number;
  isMobileView?: boolean;
}

const SessionPropertiesPanel: React.FC<Props> = ({ getCurrentTimeOffset, isMobileView = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const recordingId = useSelector(getSessionRecordingId);
  const attributes = useSelector(getSessionRecordingAttributes);
  const startTimeOffset = useSelector(getSessionRecordingStartTimeOffset);
  const isReadOnly = useSelector(getIsReadOnly);
  const sessionDescription = useSelector(getSessionRecordingDescription);
  const savedDescriptionRef = useRef(sessionDescription);

  const [startOffset, setStartOffset] = useState<number>(startTimeOffset);

  const recordingLengthInSeconds = useMemo(() => Math.floor(attributes?.duration ?? 0 / 1000), [attributes]);

  const saveStartTimeOffset = useMemo(
    () =>
      debounce((value: number) => {
        dispatch(sessionRecordingActions.setStartTimeOffset(value));
        if (recordingId) {
          updateStartTimeOffset(user?.details?.profile?.uid, recordingId, value);
        }
      }, 1000),
    [dispatch, recordingId, user?.details?.profile?.uid]
  );

  const onStartTimeOffsetChange = useCallback(
    (newOffset: number) => {
      setStartOffset(newOffset);
      saveStartTimeOffset(newOffset);
    },
    [saveStartTimeOffset]
  );

  const saveDescription = useCallback(
    (value: string) => {
      if (recordingId && value !== savedDescriptionRef.current) {
        updateDescription(user?.details?.profile?.uid, recordingId, value);
        savedDescriptionRef.current = value;
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

  if (isReadOnly && !sessionDescription) return null;

  return (
    <ProCard className="session-recording-properties primary-card">
      {!isReadOnly && !isMobileView && (
        <>
          <p className="session-property-label text-bold text-white">Start time offset</p>
          <div className="session-start-time-input-wrapper">
            <InputNumber
              addonAfter="seconds"
              min={0}
              max={recordingLengthInSeconds}
              value={startOffset}
              onChange={onStartTimeOffsetChange}
            />
          </div>
          <Tooltip title="By default, video will start playing at this time." placement="right" mouseEnterDelay={0.8}>
            <RQButton
              type="link"
              icon={<AimOutlined />}
              onClick={() => onStartTimeOffsetChange(getCurrentTimeOffset())}
            >
              Select current player time
            </RQButton>
          </Tooltip>
        </>
      )}

      <p className={`${!isReadOnly ? "mt-20" : null} session-property-label text-bold text-white`}>Description</p>
      {!isReadOnly ? (
        <Input.TextArea
          rows={7}
          placeholder={"Add a description for the session"}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onBlur={(e) => saveDescription(e.target.value)}
          value={sessionDescription}
          style={{ wordBreak: "break-word", resize: "none" }}
        />
      ) : (
        sessionDescription && <div className="readonly-session-description">{sessionDescription}</div>
      )}
    </ProCard>
  );
};

export default React.memo(SessionPropertiesPanel);
