// Add panel for non-extension pages
if (chrome.devtools.inspectedWindow.tabId > 0) {
  chrome.devtools.panels.create("🔀 Requestly", "/resources/images/48x48.png", "/devtools/index.html");
}
