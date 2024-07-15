import { useState } from "react";
import { useSelector } from "react-redux";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { CustomInlineInput } from "componentsV2/CustomInlineInput/CustomInlineInput";
import "./sessionsTitle.scss";

export const SessionTitle = () => {
  const sessionMetadata = useSelector(getSessionRecordingMetaData);
  const [sessionTitle, setSessionTitle] = useState(sessionMetadata?.name || "");

  return (
    <div className="session-title-container">
      <div className="session-header-breadcrumb">
        <span className="session-header-breadcrumb__parent-route">All sessions</span>
        <span className="session-header-breadcrumb__arrow">&gt;</span>
        <CustomInlineInput
          value={sessionTitle}
          placeholder="Session title"
          valueChangeCallback={(value: string) => {
            setSessionTitle(value);
          }}
        />
      </div>
    </div>
  );
};
