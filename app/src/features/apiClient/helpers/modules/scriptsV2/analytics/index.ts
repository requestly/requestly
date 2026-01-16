import { trackEvent } from "modules/analytics";
import { RQAPI } from "features/apiClient/types";
import { WorkErrorType } from "../workloadManager/workLoadTypes";

const SCRIPT_EVENTS = {
  SCRIPT_EXECUTION_STARTED: "script_execution_started",
  SCRIPT_EXECUTION_COMPLETED: "script_execution_completed",
  SCRIPT_EXECUTION_FAILED: "script_execution_failed",
  API_CLIENT_PACKAGE_ADDED: "api_client_package_added",
  API_CLIENT_SCRIPT_WRITTEN: "api_client_script_written",
};

export const trackScriptExecutionStarted = (scriptType: RQAPI.ScriptType) => {
  trackEvent(SCRIPT_EVENTS.SCRIPT_EXECUTION_STARTED, { scriptType });
};

export const trackScriptExecutionCompleted = (scriptType: RQAPI.ScriptType) => {
  trackEvent(SCRIPT_EVENTS.SCRIPT_EXECUTION_COMPLETED, { scriptType });
};

export const trackScriptExecutionFailed = (scriptType: RQAPI.ScriptType, errorType: WorkErrorType, message: string) => {
  trackEvent(SCRIPT_EVENTS.SCRIPT_EXECUTION_FAILED, { errorType, scriptType, message });
};

export const trackPackageAdded = (packageName: string, packageType: "builtin" | "npm" | "jsr") => {
  trackEvent(SCRIPT_EVENTS.API_CLIENT_PACKAGE_ADDED, { package_name: packageName, package_type: packageType });
};

export const trackScriptWritten = (scriptType: RQAPI.ScriptType) => {
  trackEvent(SCRIPT_EVENTS.API_CLIENT_SCRIPT_WRITTEN, { scriptType });
};

export { SCRIPT_EVENTS };
