import { PUBLIC_NAMESPACE } from "common/constants";

((namespace) => {
  window[namespace] = window[namespace] || {};

  const sendMessageToExtension = (action, payload) => {
    window.postMessage({ source: "requestly:client", action, payload }, window.location.href);
  };

  const sendResponseToExtension = (action, payload) => {
    window.postMessage({ source: "requestly:client", response: true, action, payload }, window.location.href);
  };

  window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source !== window || event.data.source !== "requestly:extension") {
      return;
    }

    if (event.data.action === "startRecording") {
      window[namespace].sessionRecorder = new Requestly.SessionRecorder(event.data.payload);
      window[namespace].sessionRecorder.start();
      sendMessageToExtension("sessionRecordingStarted");
    } else if (event.data.action === "getSessionData") {
      sendResponseToExtension(event.data.action, window[namespace].sessionRecorder.getSession());
    }
  });
})(PUBLIC_NAMESPACE);
