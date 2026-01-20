import { RQSessionEventType, RRWebEventData } from "@requestly/web-sdk";
import { ConsoleLog } from "features/sessionBook/types";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getSessionRecordingAttributes, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import ConsoleLogsPanel from "views/features/sessions/SessionViewer/ConsoleLogs/ConsoleLogsPanel";
import { getConsoleLogs } from "views/features/sessions/SessionViewer/sessionEventsUtils";
import "./sessionConsoleLogs.scss";

interface SessionConsoleLogsProps {
  playerTimeOffset: number;
}
const SessionConsoleLogs: React.FC<SessionConsoleLogsProps> = ({ playerTimeOffset }) => {
  const events = useSelector(getSessionRecordingEvents);
  const attributes = useSelector(getSessionRecordingAttributes);

  const consoleLogs = useMemo<ConsoleLog[]>(() => {
    const rrwebEvents = (events?.[RQSessionEventType.RRWEB] as RRWebEventData[]) || [];
    return getConsoleLogs(rrwebEvents, attributes?.startTime);
  }, [events, attributes?.startTime]);

  if (consoleLogs) {
    return (
      <div className="session-console-logs-container">
        <ConsoleLogsPanel consoleLogs={consoleLogs} playerTimeOffset={playerTimeOffset} />
      </div>
    );
  }
};

export default React.memo(SessionConsoleLogs);
