/**
 * MIT License

Copyright (c) 2018 Contributors (https://github.com/rrweb-io/rrweb/graphs/contributors) and SmartX Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import { EventType, LogData, LogLevel, PLUGIN_NAME } from "rrweb";

enum IncrementalSource {
  Mutation = 0,
  MouseMove = 1,
  MouseInteraction = 2,
  Scroll = 3,
  ViewportResize = 4,
  Input = 5,
  TouchMove = 6,
  MediaInteraction = 7,
  StyleSheetRule = 8,
  CanvasMutation = 9,
  Font = 10,
  Log = 11,
  Drag = 12,
  StyleDeclaration = 13,
}

/**
 * define an interface to replay log records
 * (data: logData) => void> function to display the log data
 */
type ReplayLogger = Partial<
  Record<LogLevel, (log: LogData, timestamp: number) => void>
>;

type LogReplayConfig = {
  level?: LogLevel[];
  replayLogger?: ReplayLogger;
};

const ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
type PatchedConsoleLog = {
  [ORIGINAL_ATTRIBUTE_NAME]: typeof console.log;
};

const defaultLogConfig: LogReplayConfig = {
  level: [
    "assert",
    "clear",
    "count",
    "countReset",
    "debug",
    "dir",
    "dirxml",
    "error",
    "group",
    "groupCollapsed",
    "groupEnd",
    "info",
    "log",
    "table",
    "time",
    "timeEnd",
    "timeLog",
    "trace",
    "warn",
  ],
  replayLogger: undefined,
};

class LogReplayPlugin {
  private config: LogReplayConfig;

  constructor(config?: LogReplayConfig) {
    this.config = Object.assign(defaultLogConfig, config);
  }

  /**
   * generate a console log replayer which implement the interface ReplayLogger
   */
  public getConsoleLogger(): ReplayLogger {
    const replayLogger: ReplayLogger = {};
    for (const level of this.config.level!) {
      if (level === "trace") {
        replayLogger[level] = (data: LogData) => {
          const logger = ((console.log as unknown) as PatchedConsoleLog)[
            ORIGINAL_ATTRIBUTE_NAME
          ]
            ? ((console.log as unknown) as PatchedConsoleLog)[
                ORIGINAL_ATTRIBUTE_NAME
              ]
            : console.log;
          logger(
            ...data.payload.map((s) => JSON.parse(s)),
            this.formatMessage(data)
          );
        };
      } else {
        replayLogger[level] = (data: LogData) => {
          const logger = ((console[level] as unknown) as PatchedConsoleLog)[
            ORIGINAL_ATTRIBUTE_NAME
          ]
            ? ((console[level] as unknown) as PatchedConsoleLog)[
                ORIGINAL_ATTRIBUTE_NAME
              ]
            : console[level];
          logger(
            ...data.payload.map((s) => JSON.parse(s)),
            this.formatMessage(data)
          );
        };
      }
    }
    return replayLogger;
  }

  /**
   * format the trace data to a string
   * @param data the log data
   */
  private formatMessage(data: LogData): string {
    if (data.trace.length === 0) {
      return "";
    }
    const stackPrefix = "\n\tat ";
    let result = stackPrefix;
    result += data.trace.join(stackPrefix);
    return result;
  }
}

export const getReplayConsolePlugin: (
  options?: LogReplayConfig
  // @ts-ignore
) => ReplayPlugin = (options) => {
  const replayLogger =
    options?.replayLogger || new LogReplayPlugin(options).getConsoleLogger();

  return {
    // @ts-ignore
    handler(event: eventWithTime, _isSync, context) {
      let logData: LogData | null = null;
      if (
        event.type === EventType.IncrementalSnapshot &&
        event.data.source === IncrementalSource.Log
      ) {
        logData = (event.data as unknown) as LogData;
      } else if (
        event.type === EventType.Plugin &&
        event.data.plugin === PLUGIN_NAME
      ) {
        logData = event.data.payload as LogData;
      }
      if (logData) {
        try {
          if (typeof replayLogger[logData.level] === "function") {
            replayLogger[logData.level]!(logData, event.timestamp);
          }
        } catch (error) {
          if (context.replayer.config.showWarning) {
            console.warn(error);
          }
        }
      }
    },
  };
};
