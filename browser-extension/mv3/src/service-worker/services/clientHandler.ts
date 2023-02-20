export const initClientHandler = (target: chrome.scripting.InjectionTarget) => {
  chrome.scripting.executeScript({
    target,
    files: ["client.js"],
    world: "MAIN",
    // @ts-ignore
    injectImmediately: true,
  });
};
