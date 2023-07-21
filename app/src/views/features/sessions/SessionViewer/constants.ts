import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { DebugInfo } from "./types";

export const SESSION_EXPORT_TYPE = "SESSION";
export const EXPORTED_SESSION_FILE_EXTENSION = "rqly";
export const defaultDebugInfo: CheckboxValueType[] = [DebugInfo.INCLUDE_NETWORK_LOGS, DebugInfo.INCLUDE_CONSOLE_LOGS];
