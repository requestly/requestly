const extID = chrome.runtime.id;
const extVersion = chrome.runtime.getManifest()["version"];

// Add extensionID to localStorage so that page script can read and send message to it
window.localStorage.setItem("extID", extID);

document.documentElement.setAttribute("rq-ext-version", extVersion);

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case RQ.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS:
      RQ.ContentScriptMessageHandler.sendMessage(message, (response) => {
        sendResponse(response);
      });
      return true;
  }
});

RQ.SessionRecorder.setup();
