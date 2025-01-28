import { RuleType } from "@requestly/shared/types/entities/rules";

export const getEventObject = (name: string, value: string) => ({
  target: { name, value },
});

export const getBaseUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  return parsedUrl.origin + parsedUrl.pathname;
};

export const generateRuleDescription = (ruleType: RuleType, data: any) => {
  const { url } = data;
  const baseUrl = getBaseUrl(url);

  const descriptions = {
    [RuleType.REDIRECT]: `Redirect ${baseUrl}`,
    [RuleType.REPLACE]: `Replace part of ${baseUrl}`,
    [RuleType.CANCEL]: `Cancel ${baseUrl}`,
    [RuleType.REQUEST]: `Modify request body of ${baseUrl}`,
    [RuleType.RESPONSE]: `Modify response body of ${baseUrl}`,
    [RuleType.HEADERS]: `Modify headers of ${baseUrl}`,
    [RuleType.SCRIPT]: `Add a custom script to ${baseUrl}`,
    [RuleType.DELAY]: `Delay ${baseUrl}`,
    [RuleType.QUERYPARAM]: `Update query param of ${baseUrl}`,
    [RuleType.USERAGENT]: `Modify useragent for ${baseUrl}`,
  };

  return descriptions[ruleType] ?? "";
};
