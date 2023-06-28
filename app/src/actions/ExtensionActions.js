import PSMH from "../config/PageScriptMessageHandler";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import * as semver from "semver";

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

export function isExtensionVersionCompatible(compatibleVersion = "0.0.1") {
  let currentExtensionVersion = getExtensionVersion();
  currentExtensionVersion = currentExtensionVersion ? currentExtensionVersion : "0.0.1";
  return semver.gte(currentExtensionVersion, compatibleVersion);
}

function sendMessage(message) {
  return new Promise((resolve) => PSMH.sendMessage(message, resolve));
}

export function getStorageType() {
  return sendMessage({ action: "GET_STORAGE_TYPE" });
}

export function getStorageInfo() {
  return sendMessage({ action: "GET_STORAGE_INFO" });
}

export function getStorageSuperObject() {
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "GET_STORAGE_SUPER_OBJECT" }, resolve);
  });
}

export function getStorageObject(key) {
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "GET_STORAGE_OBJECT", key }, resolve);
  });
}

export function saveStorageObject(object) {
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "SAVE_STORAGE_OBJECT", object }, resolve);
  });
}

export function removeStorageObject(key) {
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "REMOVE_STORAGE_OBJECT", key }, resolve);
  });
}

// the underlying implementation is same as removeStorageObject for extension
// hence key=array to make it consistent
// reference to chrome API which accepts (string | array)
// https://developer.chrome.com/docs/extensions/reference/storage/#:~:text=Promise-,Removes,-one%20or%20more
export function removeStorageObjects(array) {
  const key = array;
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "REMOVE_STORAGE_OBJECT", key }, resolve);
  });
}

export function clearStorage() {
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "CLEAR_STORAGE" }, resolve);
  });
}

export function setStorageType(storageType) {
  return new Promise((resolve) => {
    PSMH.sendMessage({ action: "SET_STORAGE_TYPE", storageType: storageType }, resolve);
  });
}

export function getUserInfo() {
  return sendMessage({ action: "GET_USER_INFO" });
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
