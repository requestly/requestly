import React, { useState, useEffect, useRef } from "react";
import { Empty, Typography } from "antd";
import { ConsoleLog } from "../types";
import ConsoleLogRow from "./ConsoleLogRow";
import { ThemeProvider } from "@devtools-ds/themes";
import { useSelector } from "react-redux";
import { getIncludeConsoleLogs } from "store/features/session-recording/selectors";
import { trackSampleSessionClicked } from "modules/analytics/events/features/sessionRecording";
import useFocusedAutoScroll from "lib/design-system/components/RQNetworkTable/useFocusedAutoScroll";
import "./console.scss";

interface Props {
  consoleLogs: ConsoleLog[];
  playerTimeOffset: number;
}

const ConsoleLogsPanel: React.FC<Props> = ({ consoleLogs, playerTimeOffset }) => {
  const [recentLogId, setRecentLogId] = useState(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onScroll = useFocusedAutoScroll(containerRef, recentLogId);

  const isLogPending = (log: ConsoleLog) => {
    return log.timeOffset > playerTimeOffset;
  };

  const includeConsoleLogs = useSelector(getIncludeConsoleLogs);

  useEffect(() => {
    const closestLog = consoleLogs.reduce(
      (closest, log: ConsoleLog) => {
        if (log.timeOffset <= playerTimeOffset) {
          const currentLogDifference = Math.abs(playerTimeOffset - log.timeOffset);
          if (currentLogDifference < closest.minTimeDifference) {
            return { log: log, minTimeDifference: currentLogDifference };
          }
        }

        return closest;
      },
      { log: null, minTimeDifference: Infinity }
    );

    setRecentLogId(closestLog.log?.id);
  }, [consoleLogs, playerTimeOffset]);

  return (
    <div className="session-panel-content" ref={containerRef} onScroll={onScroll}>
      {consoleLogs.length ? (
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
          {consoleLogs.map((log, index) => (
            <ConsoleLogRow
              key={index}
              {...log}
              isPending={() => isLogPending(log)}
              isRecentLog={recentLogId === log.id}
            />
          ))}
        </ThemeProvider>
      ) : includeConsoleLogs === false ? (
        <div>
          <Typography.Text className="recording-options-message">
            This session does not contain any console logs. <br />
            Check out this{" "}
            <a
              href="/sessions/draft/mock/"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackSampleSessionClicked("console")}
            >
              sample session
            </a>{" "}
            to see the type of information you can send with a session.
          </Typography.Text>
        </div>
      ) : (
        <div className={"placeholder"}>
          <Empty description={"Console logs appear here as video plays."} />
        </div>
      )}
    </div>
  );
};

export default React.memo(ConsoleLogsPanel);
