// Add panel for non-extension pages
if (chrome.devtools.inspectedWindow.tabId > 0) {
  chrome.devtools.panels.create(
    "Requestly",
    "/resources/images/16x16.png",
    "/devtools/network-panel/index.html"
  );
}
