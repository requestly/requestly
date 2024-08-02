import { ScriptAttributes, ScriptCodeType, ScriptObject, ScriptType } from "../../types";
import { setVariable, Variable } from "../variable";
import { getAllSupportedWebURLs, isExtensionEnabled } from "../../utils";
import { stopRecordingOnAllTabs } from "./sessionRecording";
import { getRecord } from "../../storage";
import { STORAGE_KEYS } from "../../constants";

/* Do not refer any external variable in below function other than arguments */
const addInlineJS = (
  code: string,
  attributes: { name: string; value: string }[] = [],
  executeAfterPageLoad = false
): void => {
  const addScript = () => {
    const script = document.createElement("script");

    if (attributes.length) {
      attributes.forEach(({ name: attrName, value: attrVal }) => {
        script.setAttribute(attrName, attrVal ?? "");
      });
    } else {
      script.type = "text/javascript";
    }

    script.classList.add("__RQ_SCRIPT__");
    script.appendChild(document.createTextNode(code));
    const parent = document.head || document.documentElement;
    parent.appendChild(script);
  };
  if (executeAfterPageLoad && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addScript);
  } else {
    addScript();
  }
};

/* Do not refer any external variable in below function other than arguments */
const addJSFromURL = (
  url: string,
  attributes: { name: string; value: string }[] = [],
  executeAfterPageLoad = false
): Promise<void> => {
  return new Promise((resolve) => {
    const addScript = () => {
      const script = document.createElement("script");

      if (attributes.length) {
        attributes.forEach(({ name: attrName, value: attrVal }) => {
          script.setAttribute(attrName, attrVal ?? "");
        });
      } else {
        script.type = "text/javascript";
      }

      script.classList.add("__RQ_SCRIPT__");
      script.src = url;
      script.onload = () => resolve();

      const parent = document.head || document.documentElement;
      parent.appendChild(script);
    };
    if (executeAfterPageLoad && document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addScript);
    } else {
      addScript();
    }
  });
};

/* Do not refer any external variable in below function other than arguments */
const addInlineCSS = function (css: string, attributes: { name: string; value: string }[] = []): void {
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(css));

  if (attributes.length) {
    attributes.forEach(({ name: attrName, value: attrVal }) => {
      style.setAttribute(attrName, attrVal ?? "");
    });
  }

  style.classList.add("__RQ_SCRIPT__");
  const parent = document.head || document.documentElement;
  parent.appendChild(style);
};

/* Do not refer any external variable in below function other than arguments */
const addCSSFromURL = function (url: string, attributes: { name: string; value: string }[] = []): void {
  var link = document.createElement("link");

  if (attributes.length) {
    attributes.forEach(({ name: attrName, value: attrVal }) => {
      link.setAttribute(attrName, attrVal ?? "");
    });
  } else {
    link.type = "text/css";
    link.rel = "stylesheet";
  }

  link.href = url;
  link.classList.add("__RQ_SCRIPT__");
  const parent = document.head || document.documentElement;
  parent.appendChild(link);
};

export const injectScript = (script: ScriptObject, target: chrome.scripting.InjectionTarget): Promise<unknown> => {
  return new Promise((resolve) => {
    let func: (val: string) => void;
    if (script.codeType === ScriptCodeType.JS) {
      func = script.type === ScriptType.URL ? addJSFromURL : addInlineJS;
    } else {
      func = script.type === ScriptType.URL ? addCSSFromURL : addInlineCSS;
    }

    const scriptRuleAttributes: ScriptAttributes[] = script.attributes ?? [];

    chrome.scripting.executeScript(
      {
        target,
        func,
        args: [script.value, scriptRuleAttributes, script.loadTime === "afterPageLoad"],
        world: "MAIN",
        // @ts-ignore
        injectImmediately: true,
      },
      resolve
    );
  });
};

export const injectWebAccessibleScript = (
  scriptPath: string,
  target: chrome.scripting.InjectionTarget
): Promise<unknown> => {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target,
        files: [scriptPath],
        world: "MAIN",
        // @ts-ignore
        injectImmediately: true,
      },
      resolve
    );
  });
};

export const injectJSAtRequestSource = (code: string, requestDetails: chrome.webRequest.WebRequestDetails) => {
  injectScript(
    {
      codeType: ScriptCodeType.JS,
      type: ScriptType.CODE,
      value: code,
    },
    { tabId: requestDetails.tabId, frameIds: [requestDetails.frameId] }
  );
};

export const isNonBrowserTab = (tabId: number): boolean => {
  // A special ID value given to tabs that are not browser tabs (for example, apps and devtools windows)
  return tabId === chrome.tabs.TAB_ID_NONE;
};

export const toggleExtensionStatus = async () => {
  const extensionEnabledStatus = await isExtensionEnabled();

  const updatedStatus = !extensionEnabledStatus;
  setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, updatedStatus);
  // updateActivationStatus(updatedStatus);
  // FIXME: Memory leak here. onVariableChange sets up a listener on every toggle
  // onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, () => null);

  if (!updatedStatus) {
    stopRecordingOnAllTabs();
  }

  return updatedStatus;
};

export const getAppTabs = async (): Promise<chrome.tabs.Tab[]> => {
  const webURLs = getAllSupportedWebURLs();
  let appTabs: chrome.tabs.Tab[] = [];

  for (const webURL of webURLs) {
    const tabs = await chrome.tabs.query({ url: webURL + "/*" });
    appTabs = [...appTabs, ...tabs];
  }

  return appTabs;
};

export const getIsUserLoggedIn = async () => {
  const refreshToken = await getRecord(STORAGE_KEYS.REFRESH_TOKEN);
  return !!refreshToken;
};
