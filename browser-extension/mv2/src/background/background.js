let BG = {};
BG = window.BG = {
  Methods: {},
  statusSettings: {
    id: RQ.STORAGE_KEYS.REQUESTLY_SETTINGS,
    avoidCache: true,
    isExtensionEnabled: true,
  },
  userInfo: {
    id: RQ.STORAGE_KEYS.USER_INFO,
    avoidCache: true,
    installationDate: Date.now(),
    planName: "",
    isLoggedIn: "",
  },
  isAppOnline: false,
  extensionStatusContextMenuId: -1,
  modifiedRequestsPool: new Queue(1000),
};

BG.TAB_SERVICE_DATA = {
  CLIENT_PORT: "clientPort",
  CLIENT_LOAD_SUBSCRIBERS: "clientLoadSubscribers",
  SESSION_RECORDING: "sessionRecording",
  APPLIED_RULE_DETAILS: "appliedRuleDetails",
  TEST_RULE_DATA: "testRuleData",
};

/**
 * Applies replace rule on given url
 * @param rule definition
 * @param url Url on which rule is to be applied
 * @param details details of request
 * @returns resultingUrl after applying replace rule
 */
BG.Methods.applyReplaceRule = function (rule, url, details) {
  let pairs = rule.pairs,
    pair = null,
    from = null,
    isFromPartRegex,
    resultingUrl = url;

  for (let i = 0; i < pairs.length; i++) {
    pair = pairs[i];
    pair.from = pair.from || "";

    if (pair.source && !RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, details)) {
      continue;
    }

    // If Source Value exists and does not match, proceed with next pair
    if (
      pair.source &&
      pair.source.value &&
      RuleMatcher.matchUrlWithRuleSource(pair.source, resultingUrl, details.tabId) === null
    ) {
      continue;
    }

    // When string pair.from looks like a RegExp, create a RegExp object from it
    from = RQ.Utils.toRegex(pair.from);
    isFromPartRegex = from !== null;

    from = from || pair.from;

    // Use String.match method when from is Regex otherwise use indexOf
    // Issue-86: String.match("?a=1") fails with an error
    if ((isFromPartRegex && resultingUrl.match(from)) || resultingUrl.indexOf(from) !== -1) {
      resultingUrl = resultingUrl.replace(from, pair.to);
    }
  }

  return resultingUrl !== url ? resultingUrl : null;
};

BG.Methods.applyQueryParamModification = function (modification, url) {
  var resultingUrl = url,
    urlWithoutQueryParams = RQ.Utils.getUrlWithoutQueryParamsAndHash(url),
    urlHash = RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.HASH),
    queryString = RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.QUERY),
    queryParamsMap = RQ.Utils.getQueryParamsMap(queryString),
    paramName = modification.param,
    paramValue = modification.value;

  switch (modification.type) {
    case RQ.MODIFICATION_TYPES.ADD:
      if (modification.actionWhenParamExists === "Overwrite") {
        queryParamsMap[paramName] = [];
        queryParamsMap[paramName].push(paramValue);

        queryString = RQ.Utils.convertQueryParamMapToString(queryParamsMap);
        resultingUrl = queryString ? urlWithoutQueryParams + "?" + queryString : urlWithoutQueryParams;
        resultingUrl += urlHash;
      }

      if (modification.actionWhenParamExists === "Ignore") {
        resultingUrl = url;
      }
      break;

    case RQ.MODIFICATION_TYPES.REMOVE:
      if (paramName in queryParamsMap) {
        delete queryParamsMap[paramName];

        queryString = RQ.Utils.convertQueryParamMapToString(queryParamsMap);

        resultingUrl = queryString ? urlWithoutQueryParams + "?" + queryString : urlWithoutQueryParams;
        resultingUrl += urlHash;
      }
      break;

    case RQ.MODIFICATION_TYPES.REMOVE_ALL:
      resultingUrl = urlWithoutQueryParams + urlHash;
      break;
  }

  return resultingUrl;
};

/**
 * Apply list of query param modifications to given url
 * @param modifications
 * @param url
 * @returns Final Url after applying the given modifications to input url
 */
BG.Methods.applyQueryParamModifications = function (modifications, url) {
  var resultingUrl = url;

  modifications.forEach(function (modification) {
    resultingUrl = BG.Methods.applyQueryParamModification(modification, resultingUrl);
  });

  return resultingUrl;
};

BG.Methods.applyQueryParamRule = function (rule, url, details) {
  var pairs = rule.pairs,
    pair = null,
    resultingUrl = url;

  for (var i = 0; i < pairs.length; i++) {
    pair = pairs[i];

    // If Source does not match, proceed with next pair
    if (
      !RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, details) ||
      RuleMatcher.matchUrlWithRuleSource(pair.source, url, details.tabId) === null
    ) {
      continue;
    }

    resultingUrl = BG.Methods.applyQueryParamModifications(pair.modifications, resultingUrl);
  }

  return resultingUrl !== url ? resultingUrl : null;
};

BG.Methods.applyDelayRequestRule = function (rule, url, details) {
  var pairs = rule.pairs,
    pair = null,
    resultingUrl = url,
    delay = null,
    delayType = null;

  // add params delay=true
  const backlistDelayParams = {
    paramName: RQ.DELAY_REQUEST_CONSTANTS.DELAY_PARAM_NAME,
    paramValue: RQ.DELAY_REQUEST_CONSTANTS.DELAY_PARAM_VALUE,
  };

  for (var i = 0; i < pairs.length; i++) {
    pair = pairs[i];

    // If Source does not match, proceed with next pair
    if (
      !RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, details) ||
      RuleMatcher.matchUrlWithRuleSource(pair.source, url, details.tabId) === null
    ) {
      continue;
    }

    // If Source Value exists and does not match, proceed with next pair
    if (
      pair.source &&
      pair.source.value &&
      RuleMatcher.matchUrlWithRuleSource(pair.source, resultingUrl, details.tabId) === null
    ) {
      continue;
    }

    resultingUrl = RuleMatcher.matchValueForPredefinedFunctions(resultingUrl, details);

    delay = pair.delay;

    if (
      details.type !== RQ.DELAY_REQUEST_CONSTANTS.REQUEST_TYPE.XHR &&
      details.method === RQ.DELAY_REQUEST_CONSTANTS.METHOD_TYPE.GET
    ) {
      delayType = RQ.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.SERVER_SIDE;
      delay = pair.delay;
    } else {
      delayType = RQ.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE;
      delay = Math.min(pair.delay, RQ.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_XHR);
    }

    if (delayType === "serverSideDelay") {
      resultingUrl = RQ.CONSTANTS.DELAY_API_URL + `${delay}/${resultingUrl}`;
    } else {
      // adds delay=true query string
      resultingUrl = RQ.Utils.addQueryParamToURL(
        resultingUrl,
        backlistDelayParams.paramName,
        backlistDelayParams.paramValue,
        false
      );

      // If multiple matching pairs are present, delay is applied on the first pair matched.
      RQ.Utils.addDelay(delay);
    }

    return resultingUrl;
  }

  return null;
};

BG.Methods.addHeader = function (headers, newHeader) {
  headers.push({ name: newHeader.name, value: newHeader.value });
};

BG.Methods.removeHeader = function (headers, name) {
  for (var i = headers.length - 1; i >= 0; i--) {
    var header = headers[i];
    if (header.name && header.name.toLowerCase() === name.toLowerCase()) {
      headers.splice(i, 1);
    }
  }
};

BG.Methods.modifyHeaderIfExists = function (headers, newHeader) {
  for (var i = headers.length - 1; i >= 0; i--) {
    var header = headers[i];
    if (header.name && header.name.toLowerCase() === newHeader.name.toLowerCase()) {
      header.value = newHeader.value;
      break;
    }
  }
};

BG.Methods.replaceHeader = function (headers, newHeader) {
  BG.Methods.removeHeader(headers, newHeader.name);
  BG.Methods.addHeader(headers, newHeader);
};

/**
 *
 * @param originalHeaders Original Headers present in the HTTP(s) request
 * @param headersTarget Request/Response (Where Modification is to be done)
 * @param details (Actual details object)
 * @returns originalHeaders with modifications if modified else returns {code}null{/code}
 */
BG.Methods.modifyHeaders = function (originalHeaders, headersTarget, details) {
  var rule,
    ruleType,
    rulePairs,
    rulePair,
    isRuleApplied = false,
    modifications,
    modification,
    url = details.url,
    mainFrameUrl = BG.Methods.getMainFrameUrl(details),
    enabledRules = BG.Methods.getEnabledRules();

  for (var i = 0; i < enabledRules.length; i++) {
    rule = enabledRules[i];
    ruleType = rule.ruleType;

    if ([RQ.RULE_TYPES.HEADERS, RQ.RULE_TYPES.USERAGENT].indexOf(ruleType) === -1) {
      continue;
    }

    rulePairs = rule.pairs || [];

    for (var index = 0; index < rulePairs.length; index++) {
      rulePair = rulePairs[index];

      if (rule.version > 1) {
        if (!RuleMatcher.matchRequestWithRuleSourceFilters(rulePair.source.filters, details)) {
          continue;
        }
        modifications = rulePair.modifications?.[headersTarget] || [];
      } else {
        modifications = [rulePair];
      }

      for (var modificationIndex = 0; modificationIndex < modifications.length; ++modificationIndex) {
        modification = modifications[modificationIndex];

        // We generate modificationType, target etc for UA rule in this method. These fields are not persisted
        if (ruleType === RQ.RULE_TYPES.USERAGENT) {
          modification = BG.Methods.getUserAgentHeaderModification(modification);
        }

        if ((!(rule.version > 1) && modification.target !== headersTarget) || !modification.header) {
          continue;
        }

        if (!RuleMatcher.matchRequestWithRuleSourceFilters(rulePair.source.filters, details)) {
          continue;
        }

        // If Source Value exists and does not match, proceed with next pair
        // In UA Rule Type, we match Source Object with mainFrame as well
        if (
          rulePair.source &&
          RuleMatcher.matchUrlWithRuleSource(rulePair.source, url, details.tabId) === null &&
          !(
            ruleType === RQ.RULE_TYPES.USERAGENT &&
            rulePair.source.requestType === RQ.REQUEST_TYPES.MAIN_FRAME &&
            mainFrameUrl &&
            RuleMatcher.matchUrlWithRuleSource(rulePair.source, mainFrameUrl, details.tabId) !== null
          )
        ) {
          continue;
        }

        isRuleApplied = true;

        // Check if user has used predefinedFunction in (add/modify) header value
        var valueWithPreDefFunctionsApplied = RuleMatcher.matchValueForPredefinedFunctions(modification.value, details);

        switch (modification.type) {
          case RQ.MODIFICATION_TYPES.ADD:
            BG.Methods.addHeader(originalHeaders, {
              name: modification.header,
              value: valueWithPreDefFunctionsApplied,
            });
            break;

          case RQ.MODIFICATION_TYPES.REMOVE:
            BG.Methods.removeHeader(originalHeaders, modification.header);
            break;

          case RQ.MODIFICATION_TYPES.MODIFY:
            BG.Methods.modifyHeaderIfExists(originalHeaders, {
              name: modification.header,
              value: valueWithPreDefFunctionsApplied,
            });
            break;

          // This ensures header is sent only once.
          // If it is not present, we will add this header otherwise modify the existing one
          case RQ.MODIFICATION_TYPES.REPLACE:
            BG.Methods.replaceHeader(originalHeaders, {
              name: modification.header,
              value: valueWithPreDefFunctionsApplied,
            });
            break;
        }

        BG.Methods.logRuleApplied(
          rule,
          details,
          `modified ${headersTarget === RQ.HEADERS_TARGET.REQUEST ? "request" : "response"} headers`
        );
      }
    }
  }

  // If rule is not applied and we return headers object without any change, then chrome treats them as modification
  // And some websites break due to this.
  return isRuleApplied ? originalHeaders : null;
};

BG.Methods.getMainFrameUrl = function (details) {
  return window.tabService.getTabUrl(details.tabId);
};

BG.Methods.isTopDocumentRequest = (requestDetails) => {
  // documentLifeCycle is only used by chrome
  const isDocumentLifeCycleActive = requestDetails.documentLifecycle
    ? requestDetails.documentLifecycle === "active"
    : true;

  return requestDetails.type === "main_frame" && isDocumentLifeCycleActive;
};

BG.Methods.getUserAgentHeaderModification = function (ruleModification) {
  return {
    target: RQ.HEADERS_TARGET.REQUEST,
    type: RQ.MODIFICATION_TYPES.REPLACE,
    header: RQ.HEADER_NAMES.USER_AGENT,
    value: ruleModification.userAgent,
  };
};

BG.Methods.getMatchingRulePairs = function (sourceUrl, ruleType, requestDetails) {
  if (!BG.statusSettings.isExtensionEnabled) return [];

  return BG.Methods.getEnabledRules()
    .filter(function (enabledRule) {
      return !ruleType || enabledRule.ruleType === ruleType;
    })
    .reduce(function (matchedRulePairsSoFar, enabledRule) {
      var matchedRulePairs = enabledRule.pairs.filter(function (pair) {
        return RuleMatcher.matchUrlWithRuleSource(pair.source, sourceUrl, requestDetails.tabId) !== null;
      });
      return matchedRulePairsSoFar.concat(matchedRulePairs);
    }, []);
};

BG.Methods.getEnabledRules = function () {
  var enabledRules = [],
    allRules = [],
    groups = {};

  RQ.StorageService.records.forEach(function (record) {
    if (!record.objectType || record.objectType === RQ.OBJECT_TYPES.RULE) {
      allRules.push(record);
    } else if (record.objectType === RQ.OBJECT_TYPES.GROUP) {
      groups[record.id] = record;
    }
  });

  allRules.forEach(function (rule) {
    var group = rule.groupId && groups[rule.groupId];

    if (rule.status === RQ.RULE_STATUS.ACTIVE && (!group || group.status === RQ.GROUP_STATUS.ACTIVE)) {
      enabledRules.push(rule);
    }
  });

  return enabledRules;
};

BG.Methods.getMatchingRules = function (sourceUrl, ruleType, details) {
  if (!BG.statusSettings.isExtensionEnabled) return [];

  return BG.Methods.getEnabledRules().filter(function (rule) {
    return (
      (!ruleType || rule.ruleType === ruleType) &&
      RuleMatcher.matchUrlWithRulePairs(rule.pairs, sourceUrl, details) !== null
    );
  });
};

BG.Methods.modifyUrl = function (details) {
  var requestUrl = details.url,
    resultingUrl = null,
    enabledRules;

  // Do not modify OPTIONS request since preflight requests cannot be redirected
  if (details.method.toLowerCase() === "options") {
    return;
  }

  // Do not modify URL again if it has been already processed earlier
  if (details.requestId && BG.modifiedRequestsPool.getElementIndex(details.requestId) > -1) {
    return;
  }

  enabledRules = BG.Methods.getEnabledRules();

  for (var i = 0; i < enabledRules.length; i++) {
    var rule = enabledRules[i],
      processedUrl = null;

    switch (rule.ruleType) {
      case RQ.RULE_TYPES.REDIRECT:
        // Introduce Pairs: Transform the Redirect Rule Model to new Model to support multiple entries (pairs)
        if (typeof rule.source !== "undefined" && typeof rule.destination !== "undefined") {
          rule.pairs = [
            {
              source: {
                key: RQ.RULE_KEYS.URL,
                operator: rule.source.operator,
                value: rule.source.values[0],
              },
              destination: rule.destination,
            },
          ];

          delete rule.source;
          delete rule.destination;
        }

        processedUrl = RuleMatcher.matchUrlWithRulePairs(rule.pairs, requestUrl, details);
        processedUrl = RuleMatcher.matchValueForPredefinedFunctions(processedUrl, details);

        break;

      // In case of Cancel Request, destination url is 'javascript:'
      case RQ.RULE_TYPES.CANCEL:
        // Introduce Pairs: Transform the Cancel Rule Model to new Model to support multiple entries (pairs)
        if (typeof rule.source !== "undefined") {
          rule.pairs = [
            {
              source: {
                key: RQ.RULE_KEYS.URL,
                operator: rule.source.operator,
                value: rule.source.values[0],
              },
            },
          ];

          delete rule.source;
        }

        processedUrl = RuleMatcher.matchUrlWithRulePairs(rule.pairs, requestUrl, details);
        if (processedUrl !== null) {
          processedUrl = "javascript:";
        }
        break;

      case RQ.RULE_TYPES.REPLACE:
        processedUrl = BG.Methods.applyReplaceRule(rule, requestUrl, details);
        processedUrl = RuleMatcher.matchValueForPredefinedFunctions(processedUrl, details);

        break;

      case RQ.RULE_TYPES.QUERYPARAM:
        processedUrl = BG.Methods.applyQueryParamRule(rule, requestUrl, details);
        processedUrl = RuleMatcher.matchValueForPredefinedFunctions(processedUrl, details);

        break;

      case RQ.RULE_TYPES.DELAY:
        processedUrl = BG.Methods.applyDelayRequestRule(rule, requestUrl, details);

        break;
    }

    if (processedUrl) {
      // allow other rules to apply on resultingUrl
      requestUrl = resultingUrl = processedUrl;
      BG.Methods.logRuleApplied(rule, details, "redirected to " + resultingUrl);
    }
  }

  if (resultingUrl) {
    BG.modifiedRequestsPool.enQueue(details.requestId);
    return { redirectUrl: resultingUrl };
  }
};

BG.Methods.logRuleApplied = function (rule, requestDetails, modification) {
  if (requestDetails.tabId === chrome.tabs.TAB_ID_NONE) {
    // Requests which are fired from non-tab pages like background, chrome-extension page
    return;
  }

  BG.Methods.sendLogToDevTools(rule, requestDetails, modification);
  BG.Methods.saveExecutionLog(rule, requestDetails, modification);
  BG.Methods.sendLogToConsoleLogger(rule, requestDetails, modification);
  BG.Methods.saveExecutionCount(rule);
  BG.Methods.sendAppliedRuleDetailsToClient(rule, requestDetails);
};

BG.Methods.onBeforeRequest = (details) => {
  return BG.Methods.modifyUrl(details);
};

BG.Methods.modifyHeadersForSessionReplayPlayer = ({
  headersToUpdate,
  ruleModifiedHeaders,
  requestDetails,
  originalHeaders,
}) => {
  try {
    const requestInitiator = new URL(requestDetails.initiator ?? requestDetails.originUrl); // firefox does not contain "initiator"
    const isAppInitiator = requestInitiator.origin?.includes(RQ.configs.WEB_URL);
    const fontTypes = ["woff", "woff2", "otf", "ttf", "eot"];
    const requestURL = new URL(requestDetails.url);
    const isFontResourceLink = fontTypes.some((type) => requestURL.pathname?.endsWith(type));

    if (isAppInitiator && (requestDetails.type === "font" || isFontResourceLink)) {
      const formattedHeaders = Object.keys(headersToUpdate).map((key) => ({
        name: key,
        value: headersToUpdate[key],
      }));

      const modifyHeaders = (headers) => {
        return headers
          .filter((header) => !(header?.name?.toLowerCase() in headersToUpdate))
          .concat(...formattedHeaders);
      };

      return !ruleModifiedHeaders ? modifyHeaders(originalHeaders) : modifyHeaders(ruleModifiedHeaders);
    }
  } catch (e) {
    // do nothing
  }

  return ruleModifiedHeaders;
};

BG.Methods.modifyRequestHeadersListener = function (details) {
  var modifiedHeaders = BG.Methods.modifyHeaders(details.requestHeaders, RQ.HEADERS_TARGET.REQUEST, details);

  try {
    const requestURL = new URL(details.url);

    // Overriding referer header since for session replay player
    // it's value is app.requestly.io, which break some websites eg apple.com
    const requestHeaders = { referer: requestURL.origin + "/" };

    modifiedHeaders = BG.Methods.modifyHeadersForSessionReplayPlayer({
      requestDetails: details,
      headersToUpdate: requestHeaders,
      ruleModifiedHeaders: modifiedHeaders,
      originalHeaders: details.requestHeaders,
    });
  } catch (e) {
    // do nothing
  }

  if (modifiedHeaders !== null) {
    return { requestHeaders: modifiedHeaders };
  }
};

BG.Methods.onHeadersReceived = function (details) {
  let modifiedHeaders = BG.Methods.modifyHeaders(details.responseHeaders, RQ.HEADERS_TARGET.RESPONSE, details);

  try {
    const requestInitiator = new URL(details.initiator ?? details.originUrl); // firefox does not contain "initiator"

    // This bypasses the CORS error in session replay player
    const corsHeaders = {
      "access-control-allow-methods": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-origin": requestInitiator.origin,
    };

    modifiedHeaders = BG.Methods.modifyHeadersForSessionReplayPlayer({
      requestDetails: details,
      headersToUpdate: corsHeaders,
      ruleModifiedHeaders: modifiedHeaders,
      originalHeaders: details.responseHeaders,
    });
  } catch (e) {
    // do nothing
  }

  if (modifiedHeaders !== null) {
    return { responseHeaders: modifiedHeaders };
  }
};

BG.Methods.getRulesAndGroups = function () {
  const rules = RQ.StorageService.records.filter(function (record) {
    return record.objectType === RQ.OBJECT_TYPES.RULE;
  });

  const groups = RQ.StorageService.records.filter(function (record) {
    return record.objectType === RQ.OBJECT_TYPES.GROUP;
  });

  return { rules, groups };
};

BG.Methods.getPinnedRules = function () {
  return RQ.StorageService.records.filter(function (record) {
    return record.objectType === RQ.OBJECT_TYPES.RULE && record.isFavourite;
  });
};

/**
 *
 * @param {Boolean} populateChildren
 * @returns
 */
BG.Methods.getPinnedGroups = function (populateChildren) {
  const pinnedGroups = {};

  RQ.StorageService.records.forEach((record) => {
    if (record.objectType === RQ.OBJECT_TYPES.GROUP && record.isFavourite) {
      pinnedGroups[record.id] = { ...record, children: [] };
    }
  });

  if (populateChildren) {
    RQ.StorageService.records.forEach((record) => {
      if (!record.objectType || record.objectType === RQ.OBJECT_TYPES.RULE) {
        if (record.groupId && pinnedGroups[record.groupId]) {
          pinnedGroups[record.groupId].children.push(record);
        }
      }
    });
  }

  return Object.values(pinnedGroups);
};

BG.Methods.checkIfNoRulesPresent = function () {
  const hasRules = RQ.StorageService.records.some(function (record) {
    return record.objectType === RQ.OBJECT_TYPES.RULE;
  });

  return !hasRules;
};

BG.Methods.registerListeners = function () {
  if (!chrome.webRequest.onBeforeRequest.hasListener(BG.Methods.onBeforeRequest)) {
    chrome.webRequest.onBeforeRequest.addListener(BG.Methods.onBeforeRequest, { urls: ["<all_urls>"] }, ["blocking"]);
  }

  if (!chrome.webRequest.onBeforeSendHeaders.hasListener(BG.Methods.modifyRequestHeadersListener)) {
    var onBeforeSendHeadersOptions = ["blocking", "requestHeaders"];
    if (chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS) {
      onBeforeSendHeadersOptions.push(chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS);
    }

    chrome.webRequest.onBeforeSendHeaders.addListener(
      BG.Methods.modifyRequestHeadersListener,
      { urls: ["<all_urls>"] },
      onBeforeSendHeadersOptions
    );
  }

  if (!chrome.webRequest.onHeadersReceived.hasListener(BG.Methods.onHeadersReceived)) {
    var onHeadersReceivedOptions = ["blocking", "responseHeaders"];
    if (chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS) {
      onHeadersReceivedOptions.push(chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS);
    }

    chrome.webRequest.onHeadersReceived.addListener(
      BG.Methods.onHeadersReceived,
      { urls: ["<all_urls>"] },
      onHeadersReceivedOptions
    );
  }
};

// http://stackoverflow.com/questions/23001428/chrome-webrequest-onbeforerequest-removelistener-how-to-stop-a-chrome-web
// Documentation: https://developer.chrome.com/extensions/events
BG.Methods.unregisterListeners = function () {
  chrome.webRequest.onBeforeRequest.removeListener(BG.Methods.onBeforeRequest);
  chrome.webRequest.onBeforeSendHeaders.removeListener(BG.Methods.modifyRequestHeadersListener);
  chrome.webRequest.onHeadersReceived.removeListener(BG.Methods.onHeadersReceived);
};

BG.Methods.disableExtension = function () {
  BG.statusSettings["isExtensionEnabled"] = false;
  RQ.StorageService.saveRecord({ rq_settings: BG.statusSettings }).then(BG.Methods.handleExtensionDisabled);
};

BG.Methods.enableExtension = function () {
  BG.statusSettings["isExtensionEnabled"] = true;
  RQ.StorageService.saveRecord({ rq_settings: BG.statusSettings }).then(BG.Methods.handleExtensionEnabled);
};

BG.Methods.handleExtensionDisabled = function () {
  BG.Methods.unregisterListeners();
  chrome.contextMenus.update(BG.extensionStatusContextMenuId, {
    title: "Activate Requestly",
    onclick: BG.Methods.enableExtension,
  });

  BG.Methods.stopRecordingOnAllTabs();
  BG.Methods.sendMessageToAllAppTabs({ isExtensionEnabled: false });
  RQ.extensionIconManager.markExtensionDisabled();

  Logger.log("Requestly disabled");
};

BG.Methods.handleExtensionEnabled = function () {
  BG.Methods.registerListeners();
  chrome.contextMenus.update(BG.extensionStatusContextMenuId, {
    title: "Deactivate Requestly",
    onclick: BG.Methods.disableExtension,
  });

  RQ.extensionIconManager.markExtensionEnabled();
  BG.Methods.sendMessageToAllAppTabs({ isExtensionEnabled: true });

  Logger.log("Requestly enabled");
};

BG.Methods.checkIfExtensionEnabled = async function () {
  const alreadyStoredSettings = await RQ.StorageService.getRecord(RQ.STORAGE_KEYS.REQUESTLY_SETTINGS);
  BG.statusSettings = alreadyStoredSettings || BG.statusSettings;
  return BG.statusSettings["isExtensionEnabled"];
};

BG.Methods.toggleExtensionStatus = async function () {
  const alreadyStoredSettings = await RQ.StorageService.getRecord(RQ.STORAGE_KEYS.REQUESTLY_SETTINGS);
  BG.statusSettings = alreadyStoredSettings || BG.statusSettings;
  const extensionEnabledStatus = BG.statusSettings["isExtensionEnabled"];
  const updatedStatus = !extensionEnabledStatus;

  BG.statusSettings["isExtensionEnabled"] = updatedStatus;
  RQ.StorageService.saveRecord({ rq_settings: BG.statusSettings }).then(
    updatedStatus ? BG.Methods.handleExtensionEnabled() : BG.Methods.handleExtensionDisabled()
  );

  return updatedStatus;
};

BG.Methods.readExtensionStatus = function () {
  RQ.StorageService.getRecord(RQ.STORAGE_KEYS.REQUESTLY_SETTINGS).then((alreadyStoredSettings) => {
    BG.statusSettings = alreadyStoredSettings || BG.statusSettings;
    BG.statusSettings["isExtensionEnabled"]
      ? BG.Methods.handleExtensionEnabled()
      : BG.Methods.handleExtensionDisabled();
  });
};

BG.Methods.createContextMenu = function (title, contexts) {
  return chrome.contextMenus.create({ title, contexts, type: "normal" });
};

BG.Methods.sendMessageToAllAppTabs = function (messageObject) {
  BG.Methods.getAppTabs().then((tabs) => {
    tabs.forEach((tab) => {
      BG.Methods.sendMessageToClient(tab.id, messageObject);
    });
  });
};

BG.Methods.getAppTabs = async () => {
  const webURLs = RQ.Utils.getAllSupportedWebURLs();
  let appTabs = [];

  for (const webURL of webURLs) {
    const tabs = await new Promise((resolve) => chrome.tabs.query({ url: webURL + "/*" }, resolve));
    appTabs = [...appTabs, ...tabs];
  }

  if (appTabs.length === 0) {
    BG.isAppOnline = false;
  }
  return appTabs;
};

/**
 * Sends the message to requestly app. It takes tabId as an argument because if the app is open or not is uncertain. So there is another
 * utility, getAppTabs() which checks if app is open and returns its tabId. After being sure that the app is open, this function is called.
 * @param {Object} messageObject
 * @param {Number} tabId
 * @param {Number} timeout
 * @returns Promise resolving to {wasMessageSent,payload} from app or timeout error
 */
BG.Methods.sendMessageToApp = async (messageObject, timeout = 2000) => {
  const sendMessageToTab = (messageObject, tabId) => {
    return new Promise((resolve) => {
      BG.Methods.sendMessageToClient(tabId, messageObject, (response) => {
        resolve(response);
      });
    });
  };

  const lastTriedTabIds = [];

  while (BG.isAppOnline) {
    /* Getting one app tab (that we haven't tried sending) */
    const appTabId = await BG.Methods.getAppTabs().then((tabs) => {
      const filteredTab = tabs.find((tab) => !lastTriedTabIds.includes(tab.id));
      if (filteredTab) {
        lastTriedTabIds.push(filteredTab.id);
        return filteredTab.id;
      } else {
        BG.isAppOnline = false;
        return null;
      }
    });

    if (!appTabId) break;

    const response = await Promise.race([
      sendMessageToTab(messageObject, appTabId),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout)),
    ])
      .then((payload) => {
        if (payload) {
          return { wasMessageSent: true, payload };
        }
        return { wasMessageSent: false };
      })
      .catch((err) => {
        // todo: can add check if timeout based on err
        return { wasMessageSent: false };
      });

    if (response?.wasMessageSent) {
      return response;
    }
  }
  return null;
};

BG.Methods.handleExtensionInstalledOrUpdated = function (details) {
  if (details.reason === "install") {
    // Set installation date in storage so that we can take decisions based on usage time in future
    // we dont need it now as it is being handled in the UI and saved in firebase
    // RQ.StorageService.saveRecord({ user_info: BG.userInfo });

    chrome.tabs.create({ url: RQ.configs.WEB_URL + "/extension-installed" });
  }

  if (details.reason === "update") {
    const shouldOpenUpdatesPage = RQ.Utils.isOlderVersion(
      details.previousVersion,
      RQ.CONSTANTS.LAST_MAJOR_UPDATE_VERSION
    );

    if (shouldOpenUpdatesPage) {
      chrome.tabs.create({ url: RQ.CONSTANTS.UPDATES_PAGE_URL });
    }

    BG.Methods.getAppTabs().then((tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.executeScript(tab.id, {
          code: `window.postMessage({
            action: "${RQ.EXTENSION_MESSAGES.NOTIFY_EXTENSION_UPDATED}",
            oldVersion: "${details.previousVersion}",
            newVersion: "${chrome.runtime.getManifest().version}"
          }, "*")`,
        });
      });
    });
  }

  Logger.log("Requestly: " + details.reason);
};

BG.Methods.addListenerForExtensionMessages = function () {
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.ADD_EVENT:
        EventActions.queueEventToWrite(message.payload);
        break;

      case RQ.CLIENT_MESSAGES.ADD_EXECUTION_EVENT:
        EventActions.queueExecutionEventToWrite(message.payload);
        break;

      case RQ.CLIENT_MESSAGES.GET_SCRIPT_RULES:
        if (message.url) {
          sendResponse(
            BG.Methods.getMatchingRules(message.url, RQ.RULE_TYPES.SCRIPT, {
              tabId: sender.tab.id,
            })
          );
        }
        break;

      case RQ.CLIENT_MESSAGES.GET_USER_AGENT_RULE_PAIRS:
        if (message.url) {
          sendResponse(BG.Methods.getMatchingRulePairs(message.url, RQ.RULE_TYPES.USERAGENT, { tabId: sender.tab.id }));
        }
        break;

      case RQ.CLIENT_MESSAGES.NOTIFY_RULES_APPLIED:
        if (message.rules) {
          message.rules.forEach(function (rule) {
            BG.Methods.logRuleApplied(
              rule,
              {
                tabId: sender.tab.id,
                url: message.url,
                method: message.method,
                type: message.type,
                timeStamp: message.timeStamp,
              },
              message.modification
            );
          });
        }
        if (message.ruleIds) {
          message.ruleIds.forEach((ruleId) => {
            RQ.StorageService.getRecord(ruleId).then((rule) => {
              BG.Methods.logRuleApplied(
                rule,
                {
                  tabId: sender.tab.id,
                  url: message.url,
                  method: message.method,
                  type: message.type,
                  timeStamp: message.timeStamp,
                },
                message.modification
              );
            });
          });
        }
        break;

      case RQ.EXTENSION_MESSAGES.FOCUS_TAB:
        if (message.tabId) {
          sendResponse(window.tabService.focusTab(message.tabId));
        }
        break;

      case RQ.EXTENSION_MESSAGES.GET_RULES_AND_GROUPS:
        sendResponse(BG.Methods.getRulesAndGroups());
        break;

      case RQ.EXTENSION_MESSAGES.GET_PINNED_RULES:
        sendResponse(BG.Methods.getPinnedRules());
        break;

      case RQ.EXTENSION_MESSAGES.GET_PINNED_GROUPS:
        sendResponse(BG.Methods.getPinnedGroups(message.populateChildren));
        break;

      case RQ.EXTENSION_MESSAGES.CHECK_IF_NO_RULES_PRESENT:
        sendResponse(BG.Methods.checkIfNoRulesPresent());
        break;

      case RQ.EXTENSION_MESSAGES.GET_FLAGS:
        sendResponse(RQ.flags);
        break;

      case RQ.CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STARTED:
        BG.Methods.onSessionRecordingStartedNotification(sender.tab.id, message.markRecordingIcon);
        break;

      case RQ.CLIENT_MESSAGES.NOTIFY_SESSION_RECORDING_STOPPED:
        BG.Methods.onSessionRecordingStoppedNotification(sender.tab.id);
        break;

      case RQ.CLIENT_MESSAGES.NOTIFY_RECORD_UPDATED_IN_POPUP:
        BG.Methods.sendMessageToApp({ action: RQ.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED });
        return true;

      case RQ.EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY:
        BG.Methods.startRecordingExplicitly(message.tab ?? sender.tab, message.showWidget);
        break;

      case RQ.EXTENSION_MESSAGES.STOP_RECORDING:
        BG.Methods.stopRecording(message.tabId ?? sender.tab.id, message.openRecording);
        break;

      case RQ.EXTENSION_MESSAGES.WATCH_RECORDING:
        BG.Methods.watchRecording(message.tabId ?? sender.tab.id);
        break;

      case RQ.EXTENSION_MESSAGES.GET_TAB_SESSION:
        BG.Methods.getTabSession(message.tabId, sendResponse);
        return true;

      case RQ.EXTENSION_MESSAGES.GET_API_RESPONSE:
        BG.Methods.getAPIResponse(message.apiRequest).then(sendResponse);
        return true;

      case RQ.EXTENSION_MESSAGES.GET_EXECUTED_RULES:
        BG.Methods.getExecutedRules(message.tabId, sendResponse);
        return true;

      case RQ.CLIENT_MESSAGES.NOTIFY_PAGE_LOADED_FROM_CACHE:
        BG.Methods.onPageLoadedFromCacheNotification(sender.tab, message.payload);
        break;

      case RQ.EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED:
        BG.Methods.checkIfExtensionEnabled().then(sendResponse);
        return true;

      case RQ.EXTENSION_MESSAGES.TOGGLE_EXTENSION_STATUS:
        BG.Methods.toggleExtensionStatus().then(sendResponse);
        return true;

      case RQ.EXTENSION_MESSAGES.NOTIFY_APP_LOADED:
        BG.Methods.onAppLoadedNotification();
        break;

      case RQ.EXTENSION_MESSAGES.START_RECORDING_ON_URL:
        BG.Methods.launchUrlAndStartRecording(message.url);
        break;

      case RQ.CLIENT_MESSAGES.CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD:
        BG.Methods.cacheRecordedSessionOnClientPageUnload(sender.tab.id, message.payload);
        break;

      case RQ.EXTENSION_MESSAGES.TEST_RULE_ON_URL:
        BG.Methods.launchUrlAndStartRuleTesting(message, sender.tab.id);
        break;

      case RQ.EXTENSION_MESSAGES.SAVE_TEST_RULE_RESULT:
        BG.Methods.saveTestRuleResult(message, sender.tab);
        break;
    }
  });
};

BG.Methods.handleClientPortConnections = () => {
  chrome.runtime.onConnect.addListener((port) => {
    const senderTab = port.sender.tab;

    // for devtools and blocked pages, senderTab is not available
    if (!senderTab) {
      return;
    }

    const tabId = senderTab.id;

    // documentLifeCycle is only used by chrome and not firefox
    if (!port.sender.documentLifecycle || port.sender.documentLifecycle === "active") {
      window.tabService.resetPageData(senderTab.id);
      window.tabService.setData(tabId, BG.TAB_SERVICE_DATA.CLIENT_PORT, port);

      const clientLoadSubscribers = window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.CLIENT_LOAD_SUBSCRIBERS) || [];
      window.tabService.removeData(tabId, BG.TAB_SERVICE_DATA.CLIENT_LOAD_SUBSCRIBERS);
      clientLoadSubscribers.forEach((subscriber) => subscriber());

      BG.Methods.onClientPageLoad(senderTab);

      // It is recommended to remove the onConnect listener after connection has been established.
      // Port is only used to notify the background of client loaded, so we can disconnect it to remove the listener
      port.disconnect();
    }

    port.onDisconnect.addListener(() => {
      window.tabService.removeData(tabId, BG.TAB_SERVICE_DATA.CLIENT_PORT);

      chrome.tabs.executeScript(
        tabId,
        {
          code: "chrome.runtime.connect()",
        },
        () => {
          if (chrome.runtime.lastError) {
            // ignore
          }
        }
      );
    });
  });
};

BG.Methods.isConnectedToClient = (tabId) => {
  return !!window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.CLIENT_PORT);
};

BG.Methods.sendMessageToClient = (tabId, ...restArgs) => {
  const send = () => chrome.tabs.sendMessage(tabId, ...restArgs);

  if (BG.Methods.isConnectedToClient(tabId)) {
    send();
  } else {
    const clientLoadSubscribers = window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.CLIENT_LOAD_SUBSCRIBERS) || [];
    clientLoadSubscribers.push(send);
    window.tabService.setData(tabId, BG.TAB_SERVICE_DATA.CLIENT_LOAD_SUBSCRIBERS, clientLoadSubscribers);
  }
};

BG.Methods.getSessionRecordingConfig = async (url) => {
  const sessionRecordingConfig = await RQ.StorageService.getRecord(RQ.STORAGE_KEYS.SESSION_RECORDING_CONFIG);
  const isAutoRecordingActive = sessionRecordingConfig?.autoRecording?.isActive;
  let pageSources = sessionRecordingConfig?.pageSources || [];

  if (sessionRecordingConfig?.autoRecording) {
    if (!sessionRecordingConfig.autoRecording?.isActive) {
      return null;
    } else if (sessionRecordingConfig.autoRecording?.mode === "allPages") {
      pageSources = [
        {
          value: "*",
          key: "Url",
          isActive: true,
          operator: "Wildcard_Matches",
        },
      ];
    }
  }

  const shouldRecord =
    BG.statusSettings.isExtensionEnabled &&
    (isAutoRecordingActive ?? true) &&
    pageSources.some((pageSource) => RuleMatcher.matchUrlWithPageSource(pageSource, url) !== null);

  return shouldRecord ? sessionRecordingConfig : null;
};

BG.Methods.onSessionRecordingStartedNotification = (tabId, markRecordingIcon = true) => {
  if (markRecordingIcon) {
    RQ.extensionIconManager.markRecording(tabId);
  }
};

BG.Methods.onSessionRecordingStoppedNotification = (tabId) => {
  RQ.extensionIconManager.markNotRecording(tabId);
};

BG.Methods.cacheRecordedSessionOnClientPageUnload = (tabId, payload) => {
  const sessionRecordingData = window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.SESSION_RECORDING);

  if (sessionRecordingData) {
    window.tabService.setData(tabId, BG.TAB_SERVICE_DATA.SESSION_RECORDING, {
      ...sessionRecordingData,
      previousSession: payload.session,
      widgetPosition: payload.widgetPosition,
      recordingStartTime: payload.recordingStartTime,
    });
  }
};

BG.Methods.onAppLoadedNotification = () => {
  BG.isAppOnline = true;

  RQ.StorageService.getRecord(RQ.STORAGE_KEYS.USE_EVENTS_ENGINE).then((useEngine) => {
    if (useEngine === false) {
      EventActions.stopPeriodicEventWriter();
    } else {
      EventActions.startPeriodicEventWriter();
    }
  });

  RQ.StorageService.getRecord(RQ.STORAGE_KEYS.SEND_EXECUTION_EVENTS).then(async (sendExecutionEvents) => {
    if (sendExecutionEvents === false) {
      await EventActions.clearExecutionEvents();
    }
  });

  EventActions.sendExtensionEvents();
};

BG.Methods.onClientPageLoad = (tab) => {
  BG.Methods.handleRuleExecutionsOnClientPageLoad(tab);
  BG.Methods.handleTestRuleOnClientPageLoad(tab);
  BG.Methods.handleSessionRecordingOnClientPageLoad(tab);
};

BG.Methods.handleRuleExecutionsOnClientPageLoad = async (tab) => {
  const cachedAppliedRules = BG.Methods.getCachedAppliedRuleDetails(tab.id);

  if (cachedAppliedRules?.length > 0) {
    RQ.extensionIconManager.markRuleExecuted(tab.id);

    BG.Methods.sendMessageToClient(
      tab.id,
      {
        action: RQ.CLIENT_MESSAGES.SYNC_APPLIED_RULES,
        appliedRuleDetails: cachedAppliedRules,
        isConsoleLoggerEnabled: await RQ.StorageService.getRecord(RQ.CONSOLE_LOGGER_ENABLED),
      },
      () => {
        window.tabService.removeData(tab.id, BG.TAB_SERVICE_DATA.APPLIED_RULE_DETAILS);
      }
    );
  }
};

BG.Methods.onPageLoadedFromCacheNotification = async (tab, payload = {}) => {
  if (payload.hasExecutedRules) {
    RQ.extensionIconManager.markRuleExecuted(tab.id);
  }

  if (payload.isRecordingSession) {
    RQ.extensionIconManager.markRecording(tab.id);
  }

  await BG.Methods.handleSessionRecordingOnClientPageLoad(tab);
};

BG.Methods.handleSessionRecordingOnClientPageLoad = async (tab) => {
  let sessionRecordingData = window.tabService.getData(tab.id, BG.TAB_SERVICE_DATA.SESSION_RECORDING);

  if (!sessionRecordingData) {
    const sessionRecordingConfig = await BG.Methods.getSessionRecordingConfig(tab.url);

    if (sessionRecordingConfig) {
      sessionRecordingData = { config: sessionRecordingConfig, url: tab.url };
      const recordingMode = sessionRecordingConfig?.autoRecording?.mode;

      sessionRecordingData.showWidget = recordingMode === "custom";

      if (recordingMode === "allPages") {
        sessionRecordingData.markRecordingIcon = false;
      }

      window.tabService.setData(tab.id, BG.TAB_SERVICE_DATA.SESSION_RECORDING, sessionRecordingData);
    }
  } else if (!sessionRecordingData.explicit) {
    // stop recording if config was changed to turn off auto-recording for the session URL
    const sessionRecordingConfig = await BG.Methods.getSessionRecordingConfig(sessionRecordingData.url);

    if (!sessionRecordingConfig) {
      BG.Methods.stopRecording(tab.id);
      return;
    }
  }

  if (sessionRecordingData) {
    BG.Methods.sendMessageToClient(
      tab.id,
      {
        action: RQ.CLIENT_MESSAGES.START_RECORDING,
        payload: sessionRecordingData,
      },
      () => {
        window.tabService.setData(tab.id, BG.TAB_SERVICE_DATA.SESSION_RECORDING, {
          ...sessionRecordingData,
          notify: false,
          previousSession: null,
        });
      }
    );
  }
};

BG.Methods.handleTestRuleOnClientPageLoad = (tab) => {
  const testRuleData = window.tabService.getData(tab.id, BG.TAB_SERVICE_DATA.TEST_RULE_DATA);

  if (testRuleData) {
    BG.Methods.sendMessageToClient(tab.id, {
      action: RQ.CLIENT_MESSAGES.START_RULE_TESTING,
      ruleId: testRuleData.ruleId,
      record: testRuleData.record,
    });
  }
};

BG.Methods.saveTestReport = async (ruleId, url, appliedStatus) => {
  const testReports = (await RQ.StorageService.getRecord(RQ.STORAGE_KEYS.TEST_REPORTS)) ?? {};

  const ruleTestReports = Object.values(testReports)
    .filter((testReport) => testReport.ruleId === ruleId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));

  if (ruleTestReports.length > 2) {
    delete testReports[ruleTestReports[2].id];
  }

  const newTestReportId = RQ.commonUtils.generateUUID();
  testReports[newTestReportId] = {
    timestamp: Date.now(),
    ruleId,
    appliedStatus,
    url,
    id: newTestReportId,
  };

  await RQ.StorageService.saveRecord({
    [RQ.STORAGE_KEYS.TEST_REPORTS]: testReports,
  });

  return newTestReportId;
};

BG.Methods.launchUrlAndStartRuleTesting = (payload, openerTabId) => {
  BG.Methods.launchUrl(payload.url, openerTabId).then((tab) => {
    window.tabService.setData(tab.id, BG.TAB_SERVICE_DATA.TEST_RULE_DATA, {
      url: payload.url,
      ruleId: payload.ruleId,
      record: payload.record,
    });
  });
};

BG.Methods.saveTestRuleResult = (payload, senderTab) => {
  const testRuleData = window.tabService.getData(senderTab.id, BG.TAB_SERVICE_DATA.TEST_RULE_DATA);
  const testRuleUrl = testRuleData.url ?? senderTab.url;

  BG.Methods.saveTestReport(payload.ruleId, testRuleUrl, payload.appliedStatus).then((test_id) => {
    const isParentTabFocussed = window.tabService.focusTab(senderTab.openerTabId);
    if (!isParentTabFocussed) {
      // create new tab with URL if opener tab does not exist
      chrome.tabs.create(
        {
          url: `${RQ.configs.WEB_URL}/rules/editor/edit/${payload.ruleId}`,
        },
        (tab) => {
          window.tabService.ensureTabLoadingComplete(tab.id).then(() => {
            BG.Methods.sendMessageToClient(tab.id, {
              action: RQ.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
              testReportId: test_id,
              testPageTabId: senderTab.id,
              record: testRuleData.record,
              appliedStatus: payload.appliedStatus,
            });
          });
        }
      );
    } else {
      BG.Methods.sendMessageToClient(senderTab.openerTabId, {
        action: RQ.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
        testReportId: test_id,
        testPageTabId: senderTab.id,
        record: testRuleData.record,
        appliedStatus: payload.appliedStatus,
      });
    }
  });
};

BG.Methods.startRecordingExplicitly = async (tab, showWidget = true) => {
  const sessionRecordingConfig = await BG.Methods.getSessionRecordingConfig(tab.url);

  const sessionRecordingDataExist = !!window.tabService.getData(tab.id, BG.TAB_SERVICE_DATA.SESSION_RECORDING);
  // Auto recording is on for current tab if sessionRecordingConfig exist,
  // so forcefully start explicit recording.
  if (!sessionRecordingConfig && sessionRecordingDataExist) {
    return;
  }

  const sessionRecordingData = { explicit: true, showWidget };
  window.tabService.setData(tab.id, BG.TAB_SERVICE_DATA.SESSION_RECORDING, sessionRecordingData);

  BG.Methods.sendMessageToClient(tab.id, {
    action: RQ.CLIENT_MESSAGES.START_RECORDING,
    payload: sessionRecordingData,
  });
};

BG.Methods.launchUrlAndStartRecording = (url) => {
  BG.Methods.launchUrl(url).then((tab) => {
    window.tabService.setData(tab.id, BG.TAB_SERVICE_DATA.SESSION_RECORDING, {
      notify: true,
      explicit: true,
      showWidget: true,
    });
  });
};

BG.Methods.launchUrl = (url, openerTabId) => {
  return new Promise((resolve) => {
    window.tabService.createNewTab(url, openerTabId, resolve);
  });
};

BG.Methods.stopRecording = (tabId, openRecording) => {
  BG.Methods.sendMessageToClient(tabId, { action: RQ.CLIENT_MESSAGES.STOP_RECORDING }, () => {
    window.tabService.removeData(tabId, BG.TAB_SERVICE_DATA.SESSION_RECORDING);
  });

  if (openRecording) {
    BG.Methods.watchRecording(tabId);
  }
};

BG.Methods.watchRecording = (tabId) => {
  chrome.tabs.create({ url: `${RQ.configs.WEB_URL}/sessions/draft/${tabId}` });
};

BG.Methods.stopRecordingOnAllTabs = () => {
  Object.values(window.tabService.getTabs()).forEach(({ id: tabId }) => {
    if (tabId && window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.SESSION_RECORDING)) {
      BG.Methods.stopRecording(tabId);
    }
  });
};

BG.Methods.getExecutedRules = async (tabId, callback) => {
  BG.Methods.sendMessageToClient(
    tabId,
    {
      action: RQ.CLIENT_MESSAGES.GET_APPLIED_RULE_IDS,
    },
    async (appliedRuleIds) => {
      if (appliedRuleIds?.length > 0) {
        callback(await RQ.StorageService.getRecords(appliedRuleIds));
      } else {
        callback([]);
      }
    }
  );
};

BG.Methods.getCachedAppliedRuleDetails = (tabId) => {
  const appliedRuleDetails = window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.APPLIED_RULE_DETAILS, []);

  return appliedRuleDetails;
};

BG.devtools = {}; // tabId -> port
BG.Methods.listenDevtools = function () {
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "rq_devtools") {
      return;
    }

    port.onMessage.addListener(function (msg) {
      if (msg.action === "registerDevTool") {
        BG.devtools[msg.tabId] = port;
      }
    });

    // Remove port when destroyed (eg when devtools instance is closed)
    port.onDisconnect.addListener(function () {
      const tabId = Object.keys(BG.devtools).find((tabId) => BG.devtools[tabId] === port);
      delete BG.devtools[tabId];
    });
  });
};

BG.Methods.sendLogToDevTools = function (rule, requestDetails, modification) {
  const devTool = BG.devtools[requestDetails.tabId];

  if (!devTool) {
    return;
  }

  devTool.postMessage({
    rule,
    modification,
    timestamp: requestDetails.timeStamp || Date.now(),
    requestURL: requestDetails.url,
    requestType: requestDetails.type,
    requestMethod: requestDetails.method,
  });
};

BG.Methods.listenCommands = function () {
  chrome.commands.onCommand.addListener((command) => {
    if (command === "reload") {
      chrome.runtime.reload();
    }
  });
};

/**
 * Generates Object to render Execution Logs
 *
 * @param {Object} Metadata for execution logs
 * @returns {Object} Object to be used to render execution logs
 */
function buildExecutionLogObject({ ruleName, requestDetails, modification }) {
  const executionLogId = RQ.Utils.generateExecutionLogId();

  const executionLogObject = {
    id: executionLogId,
    requestMethod: requestDetails.method,
    timestamp: requestDetails.timeStamp,
    url: requestDetails.url,
    requestType: requestDetails.type,
    ruleName,
    modification,
  };

  if (requestDetails.type !== "main_frame") {
    executionLogObject.pageSourceUrl = window.tabService.getTabUrl(requestDetails.tabId);
  }

  return executionLogObject;
}

/**
 * Appends new execution log to the existing array
 *
 * @param {Array} existingLogs logs fetched from storage
 * @param {Object} newLogObject the new log object to append
 * @returns {Array}
 */
function appendExecutionLog(existingLogs, newLogObject) {
  if (existingLogs) {
    const newLogs = [...existingLogs];
    if (newLogs.length === RQ.CONSTANTS.LIMITS.NUMBER_EXECUTION_LOGS) {
      newLogs.shift();
    }
    return [...newLogs, newLogObject];
  }
  return [newLogObject];
}

/**
 * Saves the executionLogs to storage
 *
 * @param {Object} rule all rule data
 * @param {Object} requestDetails all request details
 * @param {String} modification the modifications applied by the rule
 */
BG.Methods.saveExecutionLog = async function (rule, requestDetails, modification) {
  const storageKey = `execution_${rule.id}`;
  const existingExecutionLogs = await RQ.StorageService.getRecord(storageKey);
  const logObject = buildExecutionLogObject({
    ruleName: rule.name,
    requestDetails,
    modification,
  });

  const newExecutionLogs = appendExecutionLog(existingExecutionLogs, logObject);

  RQ.StorageService.saveRecord({
    [storageKey]: newExecutionLogs,
  });
};

BG.Methods.isNonBrowserTab = (tabId) => {
  // A special ID value given to tabs that are not browser tabs (for example, apps and devtools windows)
  return tabId === chrome.tabs.TAB_ID_NONE;
};

BG.Methods.sendLogToConsoleLogger = async function (rule, requestDetails, modification) {
  if (BG.Methods.isNonBrowserTab(requestDetails.tabId)) {
    // content script will not be available for console logging
    return;
  }

  const storageKey = RQ.CONSOLE_LOGGER_ENABLED;
  const isConsoleLoggerEnabled = await RQ.StorageService.getRecord(storageKey);

  BG.Methods.sendMessageToClient(
    requestDetails.tabId,
    {
      action: RQ.CLIENT_MESSAGES.PRINT_CONSOLE_LOGS,
      requestDetails,
      rule,
      modification,
      isConsoleLoggerEnabled,
    },
    { frameId: requestDetails.frameId }
  );
};

/**
 * Generates Object to render Execution Logs
 *
 * @param {Object} existingExecutionCount The current object
 * @param {String} ruleType Type of Rule to be incremented
 * @returns {Object} Updated Object to be used to save execution counter
 */
function buildExecutionCountObject({ existingExecutionCount, ruleType }) {
  const today = new Date();
  const mm = today.getMonth() + 1; // +1 since 0=JAN,11=DEC
  const yyyy = today.getFullYear();

  existingExecutionCount = existingExecutionCount || {};

  if (existingExecutionCount?.[yyyy]?.[mm]?.[ruleType]) {
    // Increment if already exists
    existingExecutionCount[yyyy][mm][ruleType] = existingExecutionCount[yyyy][mm][ruleType] + 1;
  } else {
    // Set 1 if doesn't already exist
    RQ.Utils.setObjectValueAtPath(existingExecutionCount, `${yyyy}.${mm}.${ruleType}`, 1);
  }

  return existingExecutionCount;
}

/**
 * Increments the execution counter
 *
 * @param {Object} rule all rule data
 */
BG.Methods.saveExecutionCount = async function (rule) {
  const existingExecutionCount = await RQ.StorageService.getRecord("ec");
  const executionCountObject = buildExecutionCountObject({
    existingExecutionCount,
    ruleType: rule.ruleType,
  });
  RQ.StorageService.saveRecord({ ec: executionCountObject });
};

BG.Methods.getTabSession = (tabId, callback) => {
  BG.Methods.sendMessageToClient(tabId, { action: RQ.CLIENT_MESSAGES.GET_TAB_SESSION }, { frameId: 0 }, callback);
};

BG.Methods.getAPIResponse = async (apiRequest) => {
  const method = apiRequest.method || "GET";
  const headers = new Headers();
  let body = apiRequest.body;
  let url = apiRequest.url;

  if (apiRequest?.queryParams.length) {
    const urlObj = new URL(apiRequest.url);
    const searchParams = new URLSearchParams(urlObj.search);
    apiRequest.queryParams.forEach(({ key, value }) => {
      searchParams.append(key, value);
    });
    urlObj.search = searchParams.toString();
    url = urlObj.toString();
  }

  apiRequest?.headers.forEach(({ key, value }) => {
    headers.append(key, value);
  });

  if (!["GET", "HEAD"].includes(method) && apiRequest.contentType === "application/x-www-form-urlencoded") {
    const formData = new FormData();
    body?.forEach(({ key, value }) => {
      formData.append(key, value);
    });
    body = new URLSearchParams(formData);
  }

  try {
    const requestStartTime = performance.now();
    const response = await fetch(url, { method, headers, body, credentials: "omit" });
    const responseTime = performance.now() - requestStartTime;

    const responseHeaders = [];
    response.headers.forEach((value, key) => {
      responseHeaders.push({ key, value });
    });

    const responseBlob = await response.blob();
    const contentType = responseHeaders.find((header) => header.key.toLowerCase() === "content-type")?.value;

    let responseBody;
    if (contentType?.includes("image/")) {
      const getImageDataUri = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };
      responseBody = await getImageDataUri(responseBlob);
    } else {
      responseBody = await responseBlob.text();
    }

    return {
      body: responseBody,
      time: responseTime,
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
      redirectedUrl: response.url !== url ? response.url : "",
    };
  } catch (e) {
    return null;
  }
};

BG.Methods.sendAppliedRuleDetailsToClient = async (rule, requestDetails) => {
  const { tabId } = requestDetails;

  // Cache execution details until content script loads
  if (BG.Methods.isTopDocumentRequest(requestDetails)) {
    const appliedRuleDetails = window.tabService.getData(tabId, BG.TAB_SERVICE_DATA.APPLIED_RULE_DETAILS, []);
    appliedRuleDetails?.push({
      rule,
      requestDetails,
    });

    window.tabService.setData(tabId, BG.TAB_SERVICE_DATA.APPLIED_RULE_DETAILS, appliedRuleDetails);
  } else {
    BG.Methods.sendMessageToClient(
      tabId,
      {
        action: RQ.CLIENT_MESSAGES.NOTIFY_RULE_APPLIED,
        rule,
      },
      () => {
        if (!chrome.runtime.lastError) {
          RQ.extensionIconManager.markRuleExecuted(tabId);
        }
      }
    );
  }
};

BG.Methods.init = function () {
  // Create contextMenu Action to Enable/Disable Requestly (Default Options)
  chrome.contextMenus.removeAll();
  BG.extensionStatusContextMenuId = BG.Methods.createContextMenu(
    "Deactivate Requestly",
    RQ.configs.contextMenuContexts
  );

  // Handle extension install/update - https://developer.chrome.com/extensions/runtime#event-onStartup
  chrome.runtime.onInstalled.addListener(BG.Methods.handleExtensionInstalledOrUpdated);

  chrome.runtime.setUninstallURL(RQ.CONSTANTS.GOODBYE_PAGE_URL);

  StorageService.getInstance({ cacheRecords: true }, RQ).then(() => {
    Logger.log("StorageService Initialized", RQ.StorageService);

    // Fetch records
    RQ.StorageService.fetchRecords().then(BG.Methods.readExtensionStatus);
    EventActions.setEventsCount();
  });

  // Add Listener to reply to requests from extension content scripts or popup
  BG.Methods.addListenerForExtensionMessages();

  BG.Methods.handleClientPortConnections();

  BG.Methods.listenDevtools();

  BG.Methods.listenCommands();

  EventActions.startPeriodicEventWriter();
};

// Background Initialization Code
(function () {
  try {
    BG.Methods.init();
  } catch (e) {
    // Do nothing
  }
})();
