RQ.ClientRuleMatcher = (namespace) => {
  const RuleSourceKey = {
    URL: "Url",
    HOST: "host",
    PATH: "path",
  };

  const RuleSourceOperator = {
    EQUALS: "Equals",
    CONTAINS: "Contains",
    MATCHES: "Matches",
    WILDCARD_MATCHES: "Wildcard_Matches",
  };

  const toRegex = (regexStr) => {
    const matchRegExp = regexStr.match(new RegExp("^/(.+)/(|i|g|ig|gi)$"));

    if (!matchRegExp) {
      return null;
    }

    return new RegExp(matchRegExp[1], matchRegExp[2]);
  };

  const checkRegexMatch = (regexString, inputString) => {
    if (!regexString.startsWith("/")) {
      regexString = `/${regexString}/`; // Keeping enclosing slashes for regex as optional
    }

    const regex = toRegex(regexString);
    return regex?.test(inputString);
  };

  const checkWildCardMatch = (wildCardString, inputString) => {
    const regexString = "/^" + wildCardString.replaceAll("*", ".*") + "$/";
    return checkRegexMatch(regexString, inputString);
  };

  const extractUrlComponent = (url, key) => {
    const urlObj = new URL(url);

    switch (key) {
      case RuleSourceKey.URL:
        return url;
      case RuleSourceKey.HOST:
        return urlObj.host;
      case RuleSourceKey.PATH:
        return urlObj.pathname;
    }
  };

  window[namespace] = window[namespace] || {};
  window[namespace].matchSourceUrl = (sourceObject, url) => {
    const urlComponent = extractUrlComponent(url, sourceObject.key);
    const value = sourceObject.value;

    if (!urlComponent) {
      return false;
    }

    switch (sourceObject.operator) {
      case RuleSourceOperator.EQUALS:
        if (value === urlComponent) {
          return true;
        }
        break;

      case RuleSourceOperator.CONTAINS:
        if (urlComponent.indexOf(value) !== -1) {
          return true;
        }
        break;

      case RuleSourceOperator.MATCHES: {
        return checkRegexMatch(value, urlComponent);
      }

      case RuleSourceOperator.WILDCARD_MATCHES: {
        return checkWildCardMatch(value, urlComponent);
      }
    }

    return false;
  };
};
