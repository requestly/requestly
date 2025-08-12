// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "runCurlRequest",
    title: "Run cURL Request",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "runCurlRequest") {
    const selectedText = info.selectionText;
    
    // Execute script in the active tab to show alert
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        alert(`Selected text for cURL request: ${text}`);
      },
      args: [selectedText]
    });
  }
});
