import { ScriptCodeType, ScriptObject, ScriptType } from "common/types";
import { getVariable, onVariableChange, setVariable, Variable } from "../variable";
import { updateActivationStatus } from "./contextMenu";
import { getAllSupportedWebURLs } from "../../utils";

/* Do not refer any external variable in below function other than arguments */
const addInlineJS = (code: string, executeAfterPageLoad = false): void => {
  const addScript = () => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.className = "__RQ_SCRIPT__";
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
const addRemoteJS = (url: string, executeAfterPageLoad = false): void => {
  const addScript = () => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.className = "__RQ_SCRIPT__";
    script.src = url;
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
const addInlineCSS = function (css: string): void {
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  style.className = "__RQ_SCRIPT__";
  const parent = document.head || document.documentElement;
  parent.appendChild(style);
};

/* Do not refer any external variable in below function other than arguments */
const addRemoteCSS = function (url: string): void {
  var link = document.createElement("link");
  link.href = url;
  link.type = "text/css";
  link.rel = "stylesheet";
  link.className = "__RQ_SCRIPT__";
  const parent = document.head || document.documentElement;
  parent.appendChild(link);
};

export const injectScript = (script: ScriptObject, target: chrome.scripting.InjectionTarget): Promise<unknown> => {
  return new Promise((resolve) => {
    let func: (val: string) => void;
    if (script.codeType === ScriptCodeType.JS) {
      func = script.type === ScriptType.URL ? addRemoteJS : addInlineJS;
    } else {
      func = script.type === ScriptType.URL ? addRemoteCSS : addInlineCSS;
    }

    chrome.scripting.executeScript(
      {
        target,
        func,
        args: [script.value, script.loadTime === "afterPageLoad"],
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

export const isExtensionEnabled = async (): Promise<boolean> => {
  return await getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true);
};

export const toggleExtensionStatus = async () => {
  const extensionEnabledStatus = await getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true);

  const updatedStatus = !extensionEnabledStatus;
  setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, updatedStatus);
  updateActivationStatus(updatedStatus);
  onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, updateActivationStatus);

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
