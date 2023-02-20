// Add panel for non-extension pages
if (chrome.devtools.inspectedWindow.tabId > 0) {
  chrome.devtools.panels.create(
    "Requestly",
    "/resources/images/16x16.png",
    "/generated/devtools/panel/panel.html"
  );

  /* Disabling network traffic, until it is merged with Requestly devtool tab */
  // chrome.devtools.panels.create(
  //   "RQ Network",
  //   "/resources/images/16x16.png",
  //   "/generated/devtools/network-panel/index.html"
  // );
}
