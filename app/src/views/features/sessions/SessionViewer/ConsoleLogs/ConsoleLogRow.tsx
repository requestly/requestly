import React, { useMemo, useState } from "react";
import { ConsoleLog } from "../types";
import LogIcon from "./LogIcon";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Col, Collapse, Row, Space } from "antd";
import { RQButton } from "lib/design-system/components";
import { isAppOpenedInIframe } from "utils/AppUtils";
import "./console.scss";
interface LogRowProps extends ConsoleLog {
  isPending: () => boolean;
  isRecentLog: boolean;
}

const ConsoleLogRow: React.FC<LogRowProps> = ({
  id,
  timeOffset,
  level,
  payload,
  trace = [],
  isPending,
  isRecentLog,
}) => {
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);
  const [showFullMessage, setShowFullMessage] = useState(false);

  const toggleFullMessage = () => {
    setShowFullMessage(!showFullMessage);
  };

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
    const parsedObjects = parsedPayload.reduce((acc, value, index) => {
      try {
        let parsedValue = JSON.parse(value);
        if (parsedValue === "undefined") {
          parsedValue = undefined;
        }

        if (typeof parsedValue === "object") {
          acc.push(<ObjectInspector key={index} data={parsedValue} includePrototypes={false} />);
        }
      } catch (e) {
        // Do nothing for values that can't be parsed
      }

      return acc;
    }, []);

    if (parsedObjects.length === 0) {
      return (
        <Space wrap align="start">
          {parsedPayload.map((value, index) => (
            <span key={index}>{value}</span>
          ))}
        </Space>
      );
    }

    return (
      <Space wrap align="start">
        {parsedObjects}
      </Space>
    );
  }, [parsedPayload]);

  return parsedPayload.length === 0 ? null : (
    <Row
      className={`session-details-panel-row console-log-row ${
        parsedLevel === "error" ? "error-log" : parsedLevel === "warn" ? "warning-log" : "default-log"
      } ${isPending() ? "pending-log" : ""} ${isRecentLog ? "recent-log-border" : ""}`}
      data-resource-id={id}
    >
      <Col span={24} className="display-flex">
        <Col span={logSource ? 17 : 24}>
          {parsedLevel === "error" || parsedLevel === "warn" ? (
            <Collapse ghost className="console-log-collapse">
              <Collapse.Panel
                className="console-log-panel"
                key={id}
                header={
                  <div className="primary-message" style={{ display: "flex", alignItems: "flex-start" }}>
                    <LogIcon level={parsedLevel} className="log-icon" />
                    <span className={`console-log-message ${parsedLevel}`}>{message}</span>
                  </div>
                }
              >
                <>
                  {!isInsideIframe && (
                    <div className="secondary-message">
                      {logSource === null && trace.length > 0 ? (
                        <div className={`trace-logs-wrapper ${parsedLevel}`}>
                          {trace.map((traceRow, index) => (
                            <div key={index} className="trace-log">
                              <span>at {traceRow}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              </Collapse.Panel>
            </Collapse>
          ) : (
            <div className="primary-message" style={{ display: "flex", alignItems: "flex-start" }}>
              <LogIcon level={parsedLevel} className="log-icon" />
              <span className={`console-log-message ${parsedLevel}`}>
                {parsedPayload.length > 2 && !showFullMessage ? (
                  <>
                    <div className="message-preview">
                      {parsedPayload.slice(0, 2).map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    <RQButton type="link" onClick={toggleFullMessage} className="see-more-button">
                      (See more)
                    </RQButton>
                  </>
                ) : (
                  <>
                    {parsedPayload.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                    {parsedPayload.length > 2 && (
                      <RQButton type="link" onClick={toggleFullMessage} className="see-more-button">
                        (See less)
                      </RQButton>
                    )}
                  </>
                )}
              </span>
            </div>
          )}
        </Col>
        {!isInsideIframe && logSource && (
          <Col span={6} className="right-info">
            {logSource}
          </Col>
        )}
      </Col>
    </Row>
  );
};

export default ConsoleLogRow;
