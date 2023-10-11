import React, { useMemo } from "react";
import { ConsoleLog } from "../types";
import LogIcon from "./LogIcon";
import SessionDetailsPanelRow from "../SessionDetailsPanelRow";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Space } from "antd";

interface LogRowProps extends ConsoleLog {
  isPending: () => boolean;
}

const ConsoleLogRow: React.FC<LogRowProps> = ({ timeOffset, level, payload, trace = [], isPending }) => {
  const parsedLevel = useMemo(() => {
    if (level === "assert" && payload[0] === "false") {
      return "error";
    }
    return level;
  }, [level, payload]);

  const parsedPayload = useMemo(() => {
    if (level === "assert") {
      const [assertionResult, ...restPayload] = payload;
      if (assertionResult === "false") {
        return ["Assertion failed:", ...restPayload];
      }
      return [];
    }
    return payload;
  }, [level, payload]);

  const logSource = useMemo(() => {
    if (trace.length === 1) {
      if (trace[0].startsWith(":")) {
        return "";
      }

      const traceMatches = /^(https?):\/\/(.+)\/([^:]+)((:\d+)*)$/.exec(trace[0]);
      if (traceMatches) {
        const [, scheme, path, file, line] = traceMatches;
        const link = `${scheme}://${path}/${file}`;
        return (
          <a href={link} target="_blank" rel="noreferrer">
            <span className="log-source">{file}</span>
            <span>{line}</span>
          </a>
        );
      }
    }
    return null;
  }, [trace]);

  const message = useMemo(() => {
    return (
      <Space wrap align="start">
        {parsedPayload.map((value, index) => {
          try {
            let parsedValue = JSON.parse(value);
            if (parsedValue === "undefined") {
              parsedValue = undefined;
            }

            if (parsedLevel === "error" && typeof parsedValue === "string") {
              return <span key={index}>{parsedValue}</span>;
            }

            return <ObjectInspector key={index} data={parsedValue} includePrototypes={false} />;
          } catch (e) {
            return <span key={index}>{value}</span>;
          }
        })}
      </Space>
    );
  }, [parsedLevel, parsedPayload]);

  return parsedPayload.length === 0 ? null : (
    <SessionDetailsPanelRow
      className={`console-log-row ${
        parsedLevel === "error" ? "error-log" : parsedLevel === "warn" ? "warning-log" : "default-log"
      } ${isPending() ? "pending-log" : ""}`}
      timeOffset={timeOffset}
      rightInfo={logSource}
      secondaryMessage={
        logSource === null && trace.length > 0 ? (
          <div className={`trace-logs-wrapper ${parsedLevel}`}>
            {trace.map((traceRow, index) => (
              <div key={index} className="trace-log">
                <span>at {traceRow}</span>
              </div>
            ))}
          </div>
        ) : null
      }
    >
      <LogIcon level={parsedLevel} className="log-icon" />
      <span className={`console-log-message ${parsedLevel}`}>{message}</span>
    </SessionDetailsPanelRow>
  );
};

export default ConsoleLogRow;
