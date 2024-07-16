import { useDispatch, useSelector } from "react-redux";
import { getSessionRecordingId, getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { CustomInlineInput } from "componentsV2/CustomInlineInput/CustomInlineInput";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { updateSessionName } from "../utils";
import { getUserAuthDetails } from "store/selectors";
import "./sessionsTitle.scss";

export const SessionTitle = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const recordingId = useSelector(getSessionRecordingId);
  const sessionMetadata = useSelector(getSessionRecordingMetaData);

  const handleSessionNameUpdate = () => {
    if (recordingId && sessionMetadata?.name) {
      updateSessionName(user?.details?.profile?.uid, recordingId, sessionMetadata.name);
    }
  };

  return (
    <div className="session-title-container">
      <div className="session-header-breadcrumb">
        <span className="session-header-breadcrumb__parent-route">All sessions</span>
        <span className="session-header-breadcrumb__arrow">&gt;</span>
        <CustomInlineInput
          value={sessionMetadata?.name}
          placeholder="Session title"
          onChange={(value: string) => {
            dispatch(sessionRecordingActions.setName(value));
          }}
          onBlur={handleSessionNameUpdate}
        />
      </div>
    </div>
  );
};
