const isFirefox = () => {
  if (
    navigator !== undefined &&
    navigator.userAgent !== undefined &&
    navigator.userAgent.toLowerCase().includes("firefox")
  ) {
    return true;
  }

  return false;
};

// Add panel for non-extension pages
const devToolPanelName = isFirefox() ? "Requestly" : "🔀 Requestly";
const iconPath = isFirefox() ? "/resources/images/48x48.png" : "";

if (chrome.devtools.inspectedWindow.tabId > 0) {
  chrome.devtools.panels.create(devToolPanelName, iconPath, "/devtools/index.html");
}
