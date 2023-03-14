import React, { useEffect, useMemo } from "react";
import { Empty, Typography } from "antd";
import { ConsoleLog } from "../types";
import ConsoleLogRow from "./ConsoleLogRow";
import useAutoScrollableContainer from "hooks/useAutoScrollableContainer";
import { ThemeProvider } from "@devtools-ds/themes";
import { useSelector } from "react-redux";
import { getIncludeConsoleLogs } from "store/features/session-recording/selectors";

interface Props {
  consoleLogs: ConsoleLog[];
  playerTimeOffset: number;
  updateCount: (count: number) => void;
}

const ConsoleLogsPanel: React.FC<Props> = ({
  consoleLogs,
  playerTimeOffset,
  updateCount,
}) => {
  const visibleConsoleLogs = useMemo<ConsoleLog[]>(() => {
    return consoleLogs.filter((consoleLog: ConsoleLog) => {
      return consoleLog.timeOffset <= playerTimeOffset;
    });
  }, [consoleLogs, playerTimeOffset]);

  const [containerRef, onScroll] = useAutoScrollableContainer<HTMLDivElement>(
    visibleConsoleLogs
  );

  const includeConsoleLogs = useSelector(getIncludeConsoleLogs);
  console.log("!!!debug", "component", includeConsoleLogs);

  useEffect(() => {
    updateCount(visibleConsoleLogs.length);
  }, [visibleConsoleLogs, updateCount]);

  return (
    <div
      className="session-panel-content"
      ref={containerRef}
      onScroll={onScroll}
    >
      {visibleConsoleLogs.length ? (
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
          {visibleConsoleLogs.map((log, i) => (
            <ConsoleLogRow key={i} {...log} />
          ))}
        </ThemeProvider>
      ) : (
        <div className="placeholder">
          {includeConsoleLogs === false ? (
            <Typography.Text>
              This session does not contain any network requests. <br />
              Check out this
              <a href="/sessions/draft/mock/" target="_blank" rel="noreferrer">
                sample session
              </a>
              to see the type of information you can send with a session.
            </Typography.Text>
          ) : (
            <Empty description={"Console logs appear here as video plays."} />
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ConsoleLogsPanel);
