// static scripts can be executed using chrome.scripting.executeScript({file:...})
// but for dynamic scripts, we need to use the following approach
export const cacheJsonOnPage = (jsonToCache: Record<string, any>) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("libs/cacheJson.js");
  script.onload = () => script.remove();
  script.dataset.params = JSON.stringify(jsonToCache);
  (document.head || document.documentElement).appendChild(script);
};
