const extID = chrome.runtime.id;
const extVersion = chrome.runtime.getManifest()["version"];

// Add extensionID to localStorage so that page script can read and send message to it
window.localStorage.setItem("extID", extID);

document.documentElement.setAttribute("rq-ext-version", extVersion);

RQ.Utils.submitAttr("ext_id", extID);
RQ.Utils.submitAttr("ext_version", extVersion);
RQ.Utils.submitAttr(
  "last_activity",
  RQ.Utils.formatDate(Date.now(), "yyyy-mm-dd")
);

RQ.SessionRecorder.setup();
