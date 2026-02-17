import { ScriptAttributes, ScriptCodeType, ScriptObject, ScriptType } from "common/types";
import { setVariable, Variable } from "../variable";
import { sendMessageToApp } from "./messageHandler/sender";
import { CLIENT_MESSAGES } from "common/constants";
import extensionIconManager from "./extensionIconManager";
import { updateActivationStatus } from "./contextMenu";
import { tabService } from "./tabService";

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

export const updateExtensionStatus = async (newStatus: boolean) => {
  if (typeof newStatus !== "boolean") {
    console.log(`[updateExtensionStatus] newStatus is not boolean but ${typeof newStatus}. returning...`);
    throw new Error(`[updateExtensionStatus] newStatus is not boolean but ${typeof newStatus}`);
  }

  console.log(`[updateExtensionStatus] starting...`, {
    newStatus,
    extensionIconState: extensionIconManager.getState(),
  });

  await setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, newStatus);
  updateActivationStatus(newStatus);
  sendMessageToApp({
    action: CLIENT_MESSAGES.NOTIFY_EXTENSION_STATUS_UPDATED,
    isExtensionEnabled: newStatus,
    extensionIconState: extensionIconManager.getState(),
  });

  return newStatus;
};

export const triggerOpenCurlModalMessage = async (
  defaultCurlConfig: { selectedText?: string; pageURL?: string },
  source: string
) => {
  try {
    // Create a new tab with the web URL
    const newTab = await tabService.createAppTab();

    // Wait for the tab to load completely
    await tabService.ensureTabLoadingComplete(newTab.id);
    console.log("!!!debug", "tab loading complete", Date.now());

    // Send message to the new tab to open cURL import modal with pre-filled text
    const message = {
      action: CLIENT_MESSAGES.OPEN_CURL_IMPORT_MODAL,
      payload: {
        curlCommand: defaultCurlConfig.selectedText ?? "",
        pageURL: defaultCurlConfig.pageURL,
        source,
      },
    };

    console.log("!!!debug", "sent message", Date.now());
    // Send message without expecting a response (one-way notification)
    chrome.tabs.sendMessage(newTab.id, message);
  } catch (error) {
    console.error(`[triggerOpenCurlModalMessage] Error:`, error);
  }
};
