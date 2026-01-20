import PSMH from "../config/PageScriptMessageHandler";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import * as semver from "semver";
import UAParser from "ua-parser-js";

export function getExtensionVersion() {
  return document.documentElement.getAttribute("rq-ext-version");
}

export function getExtensionManifestVersion() {
  return document.documentElement.getAttribute("rq-ext-mv");
}

export function isExtensionManifestVersion3() {
  return getExtensionManifestVersion() === "3";
}

export function isExtensionInstalled() {
  return !!getExtensionVersion();
}

export const isSafariBrowser = () => {
  const parser = new UAParser(window.navigator.userAgent);
  const result = parser.getResult();
  const browser = result.browser.name;

  return browser === "Safari";
};

export const isSafariExtension = () => {
  return isSafariBrowser() && isExtensionInstalled();
};

export function isSessionBearExtensionInstalled() {
  return document.documentElement.getAttribute("rq-ext-name") === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR;
}

export function isExtensionVersionCompatible(compatibleVersion = "0.0.1") {
  let currentExtensionVersion = getExtensionVersion();
  currentExtensionVersion = currentExtensionVersion ? currentExtensionVersion : "0.0.1";
  return semver.gte(currentExtensionVersion, compatibleVersion);
}

function sendMessage(message) {
  return new Promise((resolve) => PSMH.sendMessage(message, resolve));
}

export function getTabSession(tabId) {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.GET_TAB_SESSION,
    tabId,
  });
}

export function notifyAppLoadedToExtension() {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_APP_LOADED,
  });
}

export function getAPIResponse(apiRequest) {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.GET_API_RESPONSE,
    apiRequest,
  });
}

export function startRecordingOnUrl(url) {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.START_RECORDING_ON_URL,
    url,
  });
}

export function testRuleOnUrl(testOptions) {
  const { url, ruleId, record } = testOptions;
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.TEST_RULE_ON_URL,
    url,
    ruleId,
    record,
  });
}

export function checkIsProxyApplied() {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.IS_PROXY_APPLIED,
  });
}

export function disconnectFromDesktopApp() {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.DISCONNECT_FROM_DESKTOP_APP,
  });
}

export function isExtensionEnabled() {
  return sendMessage({
    action: GLOBAL_CONSTANTS.EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED,
  });
}
