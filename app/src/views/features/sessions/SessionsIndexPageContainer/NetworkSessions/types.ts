import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

export interface NetworkSessionRecord { // todo: rename to Saved Log in some way
  name: string;
  id: string;
  createdTs: number;
  fileName: string;
  har?: Har;
}

export interface HarFileRecord { // maybe
  name: string;
  id: string; // temp Id
  fileName: string;
  filePath: string;
  har?: Har;
}