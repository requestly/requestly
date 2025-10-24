import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CgAlignCenter } from "@react-icons/all-files/cg/CgAlignCenter";
import { MdOutlineViewHeadline } from "@react-icons/all-files/md/MdOutlineViewHeadline";
import { IoIosGlobe } from "@react-icons/all-files/io/IoIosGlobe";
import { IoMdTime } from "@react-icons/all-files/io/IoMdTime";
import { MdToday } from "@react-icons/all-files/md/MdToday";
import { InlineInput } from "componentsV2/InlineInput/InlineInput";
import {
  getIsRequestedByOwner,
  getSessionRecordingAttributes,
  getSessionRecordingId,
  getSessionRecordingMetaData,
} from "store/features/session-recording/selectors";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { updateSessionDescription, updateSessionName } from "../../../../screens/SavedSessionScreen/components/utils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { useRBAC } from "features/rbac";
import "./sessionInfo.scss";

export const SessionInfo: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const recordingId = useSelector(getSessionRecordingId);
  const sessionMetadata = useSelector(getSessionRecordingMetaData);
  const sessionAttributes = useSelector(getSessionRecordingAttributes);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "update");

  const [sessionName, setSessionName] = useState(sessionMetadata?.name);
  const [sessionDescription, setSessionDescription] = useState(sessionMetadata?.description);

  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  const handleSessionNameUpdate = useCallback(() => {
    if (recordingId && sessionMetadata?.name) {
      if (sessionMetadata?.name !== sessionName && sessionMetadata?.name.length > 0) {
        updateSessionName(user?.details?.profile?.uid, recordingId, sessionName);
        setSessionName(sessionMetadata?.name);
      }
    }
  }, [recordingId, sessionMetadata?.name, user?.details?.profile?.uid, sessionName]);

  const handleSessionDescriptionUpdate = useCallback(() => {
    if (recordingId && sessionMetadata?.description) {
      if (sessionMetadata?.description !== sessionDescription && sessionMetadata?.description.length > 0) {
        updateSessionDescription(user?.details?.profile?.uid, recordingId, sessionMetadata.description);
        setSessionDescription(sessionMetadata?.description);
      }
    }
  }, [recordingId, sessionMetadata?.description, user?.details?.profile?.uid, sessionDescription]);

  const sessionInfoData = useMemo(() => {
    return [
      {
        icon: <CgAlignCenter />,
        label: "Name",
        value: (
          <InlineInput
            value={sessionMetadata?.name}
            placeholder="Enter session name"
            onChange={(value: string) => {
              dispatch(sessionRecordingActions.setName(value));
            }}
            onBlur={handleSessionNameUpdate}
            disabled={!isRequestedByOwner || isInsideIframe || !isValidPermission}
          />
        ),
      },
      {
        icon: <MdOutlineViewHeadline />,
        label: "Description",
        value: (
          <InlineInput
            textarea
            value={sessionMetadata?.description}
            placeholder="Enter session description"
            onChange={(value: string) => {
              dispatch(sessionRecordingActions.setDescription(value));
            }}
            onBlur={handleSessionDescriptionUpdate}
            disabled={!isRequestedByOwner || isInsideIframe || !isValidPermission}
          />
        ),
      },
      { icon: <IoIosGlobe />, label: "Page URL", value: sessionAttributes?.url },
      { icon: <IoMdTime />, label: "Duration", value: msToHoursMinutesAndSeconds(sessionAttributes?.duration ?? 0) },
      { icon: <MdToday />, label: "Recorded at", value: epochToDateAndTimeString(sessionAttributes?.startTime) },
      // { icon: <MdOutlinePerson />, label: "Recorded by", value: user?.details?.profile?.email },
    ];
  }, [
    sessionAttributes,
    dispatch,
    handleSessionDescriptionUpdate,
    handleSessionNameUpdate,
    sessionMetadata?.description,
    sessionMetadata?.name,
    isRequestedByOwner,
    isInsideIframe,
    isValidPermission,
  ]);

  return (
    <div className="sessions-info-container">
      {sessionInfoData.map((info, index) => (
        <div className="sessions-info-item" key={index}>
          <span className="sessions-info-item-label">
            {info.icon}
            {info.label}
          </span>
          <span className="sessions-info-item-value">{info.value}</span>
        </div>
      ))}
    </div>
  );
};
