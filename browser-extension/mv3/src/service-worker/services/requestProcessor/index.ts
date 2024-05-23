import { AJAXRequestDetails } from "./types";
import { forwardHeadersOnRedirect } from "./handleHeadersOnRedirect";
import { handleInitiatorDomainFunction } from "./handleInitiatorDomainFunction";
import rulesStorageService from "../../../rulesStorageService";
import { RuleType } from "common/types";
import { handleCSPError } from "./handleCSPError";

class RequestProcessor {
  constructor() {}

  onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
    const enabledRules = await rulesStorageService.getEnabledRules();

    if (enabledRules.length === 0) {
      return;
    }

    const redirectReplaceRules = enabledRules.filter(
      (rule) => rule.ruleType === RuleType.REDIRECT || rule.ruleType === RuleType.REPLACE
    );
    const headerRules = enabledRules.filter((rule) => rule.ruleType === RuleType.HEADERS);

    await forwardHeadersOnRedirect(tabId, requestDetails, redirectReplaceRules);
    await handleInitiatorDomainFunction(tabId, requestDetails, headerRules);
  };

  onErrorOccurred = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
    const enabledRules = await rulesStorageService.getEnabledRules();

    if (enabledRules.length === 0) {
      return;
    }

    await handleCSPError(tabId, requestDetails);
  };
}

export const requestProcessor = new RequestProcessor();
