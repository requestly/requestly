// Content script for the extension
console.log('cURL Request Runner extension loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    alert(request.text);
  }
});
