import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { CgAlignCenter } from "@react-icons/all-files/cg/CgAlignCenter";
import { MdOutlineViewHeadline } from "@react-icons/all-files/md/MdOutlineViewHeadline";
import { IoIosGlobe } from "@react-icons/all-files/io/IoIosGlobe";
import { IoMdTime } from "@react-icons/all-files/io/IoMdTime";
import { MdToday } from "@react-icons/all-files/md/MdToday";
import { MdOutlinePerson } from "@react-icons/all-files/md/MdOutlinePerson";
import { CustomInlineInput } from "componentsV2/CustomInlineInput/CustomInlineInput";
import { getSessionRecordingAttributes, getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import "./sessionInfo.scss";

export const SessionInfo: React.FC = () => {
  const sessionMetaData = useSelector(getSessionRecordingMetaData);
  const sessionAttributes = useSelector(getSessionRecordingAttributes);
  const [sessionName, setSessionName] = useState(sessionMetaData?.name || "");
  const [sessionDescription, setSessionDescription] = useState(sessionMetaData?.description || "");

  const handleSessionNameChange = useCallback((value: string) => {
    setSessionName(value);
  }, []);

  const handleSessionDescriptionChange = useCallback((value: string) => {
    setSessionDescription(value);
  }, []);

  const sessionInfoData = useMemo(() => {
    return [
      {
        icon: <CgAlignCenter />,
        label: "Name",
        value: (
          <CustomInlineInput
            value={sessionName}
            placeholder="Enter session name"
            valueChangeCallback={handleSessionNameChange}
          />
        ),
      },
      {
        icon: <MdOutlineViewHeadline />,
        label: "Description",
        value: (
          <CustomInlineInput
            value={sessionDescription}
            placeholder="Enter session description"
            valueChangeCallback={handleSessionDescriptionChange}
          />
        ),
      },
      { icon: <IoIosGlobe />, label: "Page URL", value: sessionAttributes?.url },
      { icon: <IoMdTime />, label: "Duration", value: msToHoursMinutesAndSeconds(sessionAttributes?.duration ?? 0) },
      { icon: <MdToday />, label: "Recorded at", value: epochToDateAndTimeString(sessionAttributes?.startTime) },
      { icon: <MdOutlinePerson />, label: "Recorded by", value: "1:00 PM" },
    ];
  }, [handleSessionNameChange, sessionName, handleSessionDescriptionChange, sessionDescription, sessionAttributes]);

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
