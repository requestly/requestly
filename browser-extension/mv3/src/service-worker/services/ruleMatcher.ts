import { UrlSource, SourceKey, SourceOperator } from "common/types";

const toRegex = (regexStr: string): RegExp => {
  const matchRegExp = regexStr.match(new RegExp("^/(.+)/(|i|g|ig|gi)$"));

  if (!matchRegExp) {
    return null;
  }
  try {
    return new RegExp(matchRegExp[1], matchRegExp[2]);
  } catch {
    return null;
  }
};

const checkRegexMatch = (regexString: string, inputString: string): boolean => {
  if (!regexString.startsWith("/")) {
    regexString = `/${regexString}/`; // Keeping enclosing slashes for regex as optional
  }

  const regex = toRegex(regexString);
  return regex?.test(inputString);
};

const checkWildCardMatch = (
  wildCardString: string,
  inputString: string
): boolean => {
  const regexString = "/^" + wildCardString.replaceAll("*", ".*") + "$/";
  return checkRegexMatch(regexString, inputString);
};

const extractUrlComponent = (url: string, key: SourceKey): string => {
  const urlObj = new URL(url);

  switch (key) {
    case SourceKey.URL:
      return url;
    case SourceKey.HOST:
      return urlObj.host;
    case SourceKey.PATH:
      return urlObj.pathname;
  }
};

export const matchSourceUrl = (
  sourceObject: UrlSource,
  url: string
): boolean => {
  const urlComponent = extractUrlComponent(url, sourceObject.key);
  const value = sourceObject.value;

  if (!urlComponent) {
    return false;
  }

  switch (sourceObject.operator) {
    case SourceOperator.EQUALS:
      if (value === urlComponent) {
        return true;
      }
      break;

    case SourceOperator.CONTAINS:
      if (urlComponent.indexOf(value) !== -1) {
        return true;
      }
      break;

    case SourceOperator.MATCHES: {
      return checkRegexMatch(value, urlComponent);
    }

    case SourceOperator.WILDCARD_MATCHES: {
      return checkWildCardMatch(value, urlComponent);
    }
  }

  return false;
};
