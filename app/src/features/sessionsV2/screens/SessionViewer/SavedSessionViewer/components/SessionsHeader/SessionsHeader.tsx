import { useState } from "react";
import { CustomInlineInput } from "componentsV2/CustomInlineInput/CustomInlineInput";
import "./sessionsHeader.scss";

export const SessionsHeader = () => {
  const [sessionTitle, setSessionTitle] = useState("Pookie");

  return (
    <div className="saved-session-header">
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
