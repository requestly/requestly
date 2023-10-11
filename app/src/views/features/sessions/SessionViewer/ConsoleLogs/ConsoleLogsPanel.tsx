import React from "react";
import { Empty, Typography } from "antd";
import { ConsoleLog } from "../types";
import ConsoleLogRow from "./ConsoleLogRow";
import { ThemeProvider } from "@devtools-ds/themes";
import { useSelector } from "react-redux";
import { getIncludeConsoleLogs } from "store/features/session-recording/selectors";
import { trackSampleSessionClicked } from "modules/analytics/events/features/sessionRecording";
import "./console.scss";

interface Props {
  consoleLogs: ConsoleLog[];
  playerTimeOffset: number;
}

const ConsoleLogsPanel: React.FC<Props> = ({ consoleLogs, playerTimeOffset }) => {
  // const visibleConsoleLogs = useMemo<ConsoleLog[]>(() => {
  //   return consoleLogs.filter((consoleLog: ConsoleLog) => {
  //     return consoleLog.timeOffset <= playerTimeOffset;
  //   });
  // }, [consoleLogs, playerTimeOffset]);

  // const [containerRef, onScroll] = useAutoScrollableContainer<HTMLDivElement>(consoleLogs);
  const isLogPending = (log: ConsoleLog) => {
    return log.timeOffset > playerTimeOffset;
  };

  const includeConsoleLogs = useSelector(getIncludeConsoleLogs);

  return (
    <div className="session-panel-content">
      {consoleLogs.length ? (
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
          {consoleLogs.map((log, index) => (
            <ConsoleLogRow key={index} {...log} isPending={() => isLogPending(log)} />
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
