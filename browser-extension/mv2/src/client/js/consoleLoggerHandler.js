RQ.ConsoleLogger = {
  loggingStarted: false,
};

RQ.ConsoleLogger.setup = () => {
  window.addEventListener("message", function (event) {
    if (
      event.source !== window ||
      event.data.source !== "requestly:consoleLogger"
    ) {
      return;
    }

    if (event.data.action === "showInitialMessage") {
      RQ.ConsoleLogger.showInitialMessage(
        event.data.payload?.isConsoleLoggerEnabled
      );
    }
  });

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === RQ.PRINT_CONSOLE_LOGS) {
      RQ.ConsoleLogger.handleMessage(message);
    }
  });
};

RQ.ConsoleLogger.showInitialMessage = (isConsoleLoggerEnabled) => {
  if (RQ.ConsoleLogger.loggingStarted) {
    return;
  }

  if (isConsoleLoggerEnabled) {
    RQ.ConsoleLogger.log(
      `Applied rules will be logged in console. You may disable the feature from: ${RQ.ConsoleLogger.getSettingsUrl()}`
    );
  } else {
    RQ.ConsoleLogger.log(
      `Applied some rules on this page. You may enable logging in console from: ${RQ.ConsoleLogger.getSettingsUrl()}`
    );
  }

  RQ.ConsoleLogger.loggingStarted = true;
};

RQ.ConsoleLogger.handleMessage = (message) => {
  if (!RQ.ConsoleLogger.loggingStarted) {
    if (window === window.top) {
      RQ.ConsoleLogger.showInitialMessage(message.isConsoleLoggerEnabled);
    } else {
      window.top.postMessage(
        {
          source: "requestly:consoleLogger",
          action: "showInitialMessage",
          payload: { isConsoleLoggerEnabled: message.isConsoleLoggerEnabled },
        },
        "*"
      );
      RQ.ConsoleLogger.loggingStarted = true;
    }
  }

  if (message.isConsoleLoggerEnabled) {
    RQ.ConsoleLogger.log(
      `Applied rule %c${message.rule.name}%c on request URL: ${message.requestDetails.url}`,
      "color: green; font-weight: bold; font-style: italic",
      null,
      RQ.ConsoleLogger.buildRequestDetailsObject(message.requestDetails)
    );
  }
};

RQ.ConsoleLogger.log = (text, ...args) => {
  console.log(
    `%cRequestly%c ${text}`,
    "color:#1990ff; font-weight: bold; padding: 1px 5px; background-color: #fad408; border-radius: 4px; border: 1px solid #888;",
    null,
    ...args
  );
};

RQ.ConsoleLogger.buildRequestDetailsObject = (requestDetails) => {
  const requestDetailsObject = {
    method: requestDetails.method,
    timestamp: new Date(requestDetails.timeStamp).toLocaleString(),
  };

  if (requestDetails.type) {
    requestDetailsObject["type"] = requestDetails.type;
  }

  return requestDetailsObject;
};

RQ.ConsoleLogger.getSettingsUrl = () => {
  return RQ.configs.WEB_URL + "/settings";
};

RQ.ConsoleLogger.getRuleEditorUrl = (ruleId) => {
  return RQ.CONSTANTS.RULES_PAGE_URL + "#edit/" + ruleId;
};
