import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

export interface NetworkSessionRecord {
  name: string;
  id: string;
  createdTs: number;
  fileName: string;
  har?: Har;
}
