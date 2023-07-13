import { Har } from "../TrafficExporter/harLogs/types";

// type Networklog = HarEntry | GraphQLHarEntry | WsHAREntry | HTTP2HAREntry

// Desktop
export interface EventAction extends Record<string, unknown> {
  ruleId: string;
  ruleType: string;
  // metadata: {
  //     diff: unknown;
  // }
}

interface DesktopNetworkLog extends Record<string, unknown> {
  id: string;
  data: Har; // can be any NetworkLog
  actions: EventAction[];
}

export interface DesktopNetworkLogEvent {
  type: "request_started" | "request_end" | "response_end";
  data: DesktopNetworkLog;
}
