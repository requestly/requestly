import ProCard from "@ant-design/pro-card";
import { InputNumber, Input } from "antd";
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
// import { AimOutlined } from "@ant-design/icons";
// import InfoIcon from "components/misc/InfoIcon";
import { getUserAuthDetails } from "store/selectors";

interface Props {
  getCurrentTimeOffset: () => number;
}

const SessionPropertiesPanel: React.FC<Props> = ({ getCurrentTimeOffset }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const recordingId = useSelector(getSessionRecordingId);
  const attributes = useSelector(getSessionRecordingAttributes);
  const startTimeOffset = useSelector(getSessionRecordingStartTimeOffset);
  const isReadOnly = useSelector(getIsReadOnly);
  const sessionDescription = useSelector(getSessionRecordingDescription);

  const recordingLengthInSeconds = useMemo(() => Math.floor(attributes.duration / 1000), [attributes]);

  const saveStartTimeOffset = useMemo(
    () =>
      debounce((value: number) => {
        if (recordingId) {
          updateStartTimeOffset(user?.details?.profile?.uid, recordingId, value);
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

  if (isReadOnly && !sessionDescription) return null;

  return (
    <ProCard className="session-recording-properties primary-card">
      {!isReadOnly && (
        <>
          <p className="session-property-label text-gray">Start time offset</p>
          <div className="session-start-time-input-wrapper">
            <InputNumber
              addonAfter="seconds"
              min={0}
              max={recordingLengthInSeconds}
              value={startTimeOffset}
              onChange={onStartTimeOffsetChange}
            />
            {/* <InfoIcon text={`By default, video will start playing at this time.`} /> */}
          </div>
          {/* <div>
            <Button type="link" icon={<AimOutlined />} onClick={() => onStartTimeOffsetChange(getCurrentTimeOffset())}>
              Select current player time
            </Button>
          </div> */}
        </>
      )}

      <p className="mt-20 session-property-label text-gray">Description</p>
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
        sessionDescription && (
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{sessionDescription}</span>
        )
      )}
    </ProCard>
  );
};

export default React.memo(SessionPropertiesPanel);
