import { trackEvent } from "modules/analytics";
import { WorkErrorType } from "../workload-manager/workLoadTypes";
import { RQAPI } from "features/apiClient/types";

const SCRIPT_EVENTS = {
  SCRIPT_EXECUTION_STARTED: "SCRIPT_EXECUTION_STARTED",
  SCRIPT_EXECUTION_COMPLETED: "SCRIPT_EXECUTION_COMPLETED",
  SCRIPT_EXECUTION_FAILED: "SCRIPT_EXECUTION_FAILED",
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

export { SCRIPT_EVENTS };
