export const initCustomWidgets = (tabId: number, frameId: number) => {
  return chrome.scripting.executeScript({
    target: {
      tabId,
      frameIds: [frameId],
    },
    files: ["libs/customWidgets.js"],
    world: "MAIN",
    injectImmediately: true,
  });
};
