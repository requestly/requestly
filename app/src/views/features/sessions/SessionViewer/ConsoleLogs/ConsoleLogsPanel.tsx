import React, { useEffect, useMemo } from "react";
import { Empty } from "antd";
import { ConsoleLog } from "../types";
import ConsoleLogRow from "./ConsoleLogRow";
import useAutoScrollableContainer from "hooks/useAutoScrollableContainer";
import { ThemeProvider } from "@devtools-ds/themes";
import { useSelector } from "react-redux";
import { getSessionRecordingMetadataOptions } from "store/features/session-recording/selectors";

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

  const sessionMetadataOptions = useSelector(
    getSessionRecordingMetadataOptions
  );

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
          <Empty
            description={
              sessionMetadataOptions.includeConsoleLogs === false
                ? "Console logs have not been shared. You can choose to share them while saving."
                : "Console logs appear here as video plays."
            }
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ConsoleLogsPanel);
