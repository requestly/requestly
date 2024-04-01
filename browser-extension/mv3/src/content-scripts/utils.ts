export const executeScriptOnPageExternally = (code: string) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("libs/executeScript.js");
  script.onload = () => script.remove();
  script.dataset.params = JSON.stringify({ code });
  (document.head || document.documentElement).appendChild(script);
};
