import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getIsRequestedByOwner,
  getSessionRecordingId,
  getSessionRecordingMetaData,
} from "store/features/session-recording/selectors";
import { InlineInput } from "componentsV2/InlineInput/InlineInput";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { updateSessionName } from "../utils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { useRBAC } from "features/rbac";
import "./sessionsTitle.scss";

export const SessionTitle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const recordingId = useSelector(getSessionRecordingId);
  const sessionMetadata = useSelector(getSessionRecordingMetaData);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "update");

  const [sessionName, setSessionName] = useState(sessionMetadata?.name);

  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  const handleSessionNameUpdate = useCallback(() => {
    if (recordingId && sessionMetadata?.name) {
      if (sessionMetadata?.name !== sessionName && sessionMetadata?.name.length > 0) {
        updateSessionName(user?.details?.profile?.uid, recordingId, sessionMetadata.name);
        setSessionName(sessionMetadata?.name);
      }
    }
  }, [recordingId, sessionMetadata?.name, user?.details?.profile?.uid, sessionName]);

  return (
    <div className="session-title-container">
      <div className="session-header-breadcrumb">
        <span
          className="session-header-breadcrumb__parent-route"
          onClick={() => redirectToSessionRecordingHome(navigate)}
        >
          All sessions
        </span>
        <span className="session-header-breadcrumb__arrow">&gt;</span>
        <InlineInput
          value={sessionMetadata?.name}
          placeholder="Session title"
          onChange={(value: string) => {
            dispatch(sessionRecordingActions.setName(value));
          }}
          onBlur={handleSessionNameUpdate}
          disabled={!isRequestedByOwner || isInsideIframe || !isValidPermission}
        />
      </div>
    </div>
  );
};
