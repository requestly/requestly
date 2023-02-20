RQ.UserAgentRuleHandler = {};

RQ.UserAgentRuleHandler.setup = function () {
  const message = {
    action: RQ.CLIENT_MESSAGES.GET_USER_AGENT_RULE_PAIRS,
    url: window.location.href,
  };
  chrome.runtime.sendMessage(message, function (rulePairs) {
    if (rulePairs && rulePairs.constructor === Array && rulePairs.length > 0) {
      RQ.UserAgentRuleHandler.handleRulePairs(rulePairs);
    }
  });
};

RQ.UserAgentRuleHandler.handleRulePairs = function (rulePairs) {
  var finalUserAgentRulePair = rulePairs[rulePairs.length - 1], // only last user agent will finally be applied
    userAgent = finalUserAgentRulePair.userAgent,
    platform = RQ.UserAgentRuleHandler.getPlatformFromUserAgent(userAgent),
    vendor = RQ.UserAgentRuleHandler.getVendorFromUserAgent(userAgent);

  RQ.ClientUtils.executeJS(
    `Object.defineProperty(window.navigator, 'userAgent', { get: function() { return '${userAgent}'; } });`
  );
  RQ.ClientUtils.executeJS(
    `Object.defineProperty(window.navigator, 'vendor', { get: function() { return '${vendor}'; } });`
  );

  if (platform) {
    // override platform only if it could be derived from userAgent
    RQ.ClientUtils.executeJS(
      `Object.defineProperty(window.navigator, 'platform', { get: function() { return '${platform}'; } });`
    );
  }
};

RQ.UserAgentRuleHandler.getPlatformFromUserAgent = function (userAgent) {
  var PLATFORMS = {
    Macintosh: "MacIntel",
    Android: "Android",
    Linux: "Linux",
    iPhone: "iPhone",
    iPad: "iPad",
    Windows: "Win32",
  };

  for (var key in PLATFORMS) {
    if (userAgent.includes(key)) {
      return PLATFORMS[key];
    }
  }
};

RQ.UserAgentRuleHandler.getVendorFromUserAgent = function (userAgent) {
  var VENDORS = {
    iPhone: "Apple Computer, Inc.",
    iPad: "Apple Computer, Inc.",
    Chrome: "Google Inc.",
  };

  for (var key in VENDORS) {
    if (userAgent.includes(key)) {
      return VENDORS[key];
    }
  }

  return ""; // vendor is empty string for others
};
