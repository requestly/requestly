import { HeadersConfig, SourceUrl, Location, CharlesRuleType, SourceData } from "./charles-rule-adapters/types";
import { generateObjectId } from "utils/FormattingHelper";
import { StorageService } from "init";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";
import { trim } from "lodash";
import { Rule, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

const checkIfWildCardPresent = (value: string | number): boolean => {
  // e.g: for port if it contains wildcard then its a string else number
  return String(value).includes("*") || String(value).includes("?");
};

const getRegex = (value: string | number) => {
  return String(value).replaceAll("*", ".*").replaceAll("?", ".");
};

export const getLocation = (location: Location) => {
  const isWildCardPresent = Object.values(location).some(checkIfWildCardPresent);
  const updatedLocation = Object.entries(location).reduce((updatedLocation, [key, value]) => {
    const trimmedValue = trim(String(value), "/");

    // if wildcard present in URL then escape all the literal dots "."
    const updatedValue = isWildCardPresent ? trimmedValue.replaceAll(".", `\\.`) : trimmedValue;

    return {
      ...updatedLocation,

      // If wildcard ("*" & "?") present in the source url then converting that
      // in regex for requestly rules since we dont support "?" wildcard.
      [key]: checkIfWildCardPresent(updatedValue) ? getRegex(updatedValue) : updatedValue,
    };
  }, {} as SourceUrl["location"]);

  const { host = "", port = 443, protocol = "https", path = "", query = "" } = updatedLocation;

  const updatedPort = port ? (["80", "443", ".*"].includes(String(port)) ? `` : `:${port}`) : ``;
  const updatedPath = path ? `/${path}` : ``;
  const updatedQuery = query ? (isWildCardPresent ? `\\?${query}` : `?${query}`) : ``;

  const url = `${protocol}://${host}${updatedPort}${updatedPath}${updatedQuery}`;
  const updatedUrl = isWildCardPresent ? `/^${url.replaceAll("/", "\\/")}$/` : url;

  return {
    value: updatedUrl,
    operator: isWildCardPresent ? RuleSourceOperator.MATCHES : RuleSourceOperator.CONTAINS,
  };
};

export const getSourcesData = (locations: SourceUrl | SourceUrl[]): SourceData[] => {
  const sources = Array.isArray(locations) ? locations : [locations];
  return sources.map((source: SourceUrl) => ({ ...getLocation(source.location), status: source.enabled }));
};

export const getHeaders = (headersConfig: HeadersConfig) => {
  const requestHeaders = headersConfig.requestHeaders.map((config) => ({ ...config, id: generateObjectId() }));
  const responseHeaders = headersConfig.responseHeaders.map((config) => ({ ...config, id: generateObjectId() }));
  return { requestHeaders, responseHeaders };
};

export const createNewGroupAndSave = ({
  appMode,
  rules,
  status,
  groupName,
  onSuccess,
  onError,
}: {
  appMode: string;
  rules: Rule[];
  status: boolean;
  groupName: CharlesRuleType | string;
  onSuccess: () => void;
  onError: () => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    createNewGroup(
      appMode,
      groupName,
      (groupId: string) => {
        const updatedRules = rules.map((rule) => ({ ...rule, groupId }));
        StorageService(appMode)
          .saveMultipleRulesOrGroups(updatedRules)
          .then(() => {
            onSuccess();
            resolve();
          })
          .catch((e) => {
            onError();
            reject();
          });
      },
      status
    );
  });
};

export const convertToArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);

export const getGroupName = (name: string) => `[Charles] ${name}`;
