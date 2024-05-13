import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { Rule, RuleType } from "common/types";
import { AJAXRequestDetails } from "./types";
import { forwardHeadersOnRedirect } from "./handleHeadersOnRedirect";

class RequestProcessor {
  cachedRules: Record<string, Rule[]> = {
    redirectRules: [],
    replaceRules: [],
    headerRules: [],
  };

  private updateCachedRules = async () => {
    this.cachedRules.redirectRules = await getEnabledRules(RuleType.REDIRECT);
    this.cachedRules.replaceRules = await getEnabledRules(RuleType.REPLACE);
    this.cachedRules.headerRules = await getEnabledRules(RuleType.HEADERS);
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(this.updateCachedRules.bind(this));
  }

  onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
    if (Object.values(this.cachedRules).every((rules) => rules.length === 0)) {
      return;
    }

    await forwardHeadersOnRedirect(tabId, requestDetails, [
      ...requestProcessor.cachedRules.redirectRules,
      ...requestProcessor.cachedRules.replaceRules,
    ]);
  };
}

export const requestProcessor = new RequestProcessor();
