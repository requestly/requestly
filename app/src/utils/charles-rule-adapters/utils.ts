import { Rule, SourceOperator } from "types";
import { HeadersConfig, SourceUrl, Location, CharlesRuleType } from "./types";
import { generateObjectId } from "utils/FormattingHelper";
import { StorageService } from "init";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";

export const getLocation = (location: Location) => {
  const { host = "", port = 443, protocol = "https", path = "", query = "" } = location;

  // TODO @rohanmathur91: update logic to convert wildcard to regex match
  // 1. check wildcard, replace "*" with ".*" and "?" with "."
  // 2. handle escape for existing "." in source URL
  // 3. if ports in [80, 443] then dont concat in URL
  const isWildCardPresent = Object.values(location).some(
    (value) => String(value).includes("*") || String(value).includes("?")
  );

  const url = `${protocol}://${host}:${port}/${path}` + (query ? `?${query}` : ``);
  return {
    value: url,
    operator: isWildCardPresent ? SourceOperator.WILDCARD_MATCHES : SourceOperator.CONTAINS,
  };
};

export const getSourceUrls = (locations: SourceUrl | SourceUrl[]) => {
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
}) => {
  createNewGroup(
    appMode,
    groupName,
    (groupId: string) => {
      const updatedRules = rules.map((rule) => ({ ...rule, groupId }));
      StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRules)
        .then(() => onSuccess())
        .catch(() => onError());
    },
    null,
    status
  );
};
