import { message } from "antd";

export const toast = {};

message.config({
  top: 60,
  maxCount: 1,
  duration: 2,
});

window.toastBroadcastChannel = new BroadcastChannel("toast");
window.toastBroadcastChannel.addEventListener("message", (event) => {
  const { type, messageText, duration } = event.data;
  switch (type) {
    case "loading":
      toast.loading(messageText, duration);
      break;
    case "success":
      toast.success(messageText, duration);
      break;
    case "info":
      toast.info(messageText, duration);
      break;
    case "error":
      toast.error(messageText, duration);
      break;
    case "warn":
      toast.warn(messageText, duration);
      break;

    default:
      break;
  }
});

toast.success = (messageText, duration = 3, notifyOtherTabs) => {
  message.success(messageText, duration);
  if (notifyOtherTabs) {
    window.toastBroadcastChannel.postMessage({
      type: "load",
      messageText,
      duration,
    });
  }
};
toast.info = (messageText, duration, notifyOtherTabs) => {
  message.info(messageText, duration);
  if (notifyOtherTabs) {
    window.toastBroadcastChannel.postMessage({
      type: "info",
      messageText,
      duration,
    });
  }
};
toast.error = (messageText, duration, notifyOtherTabs) => {
  message.error(messageText);
  if (notifyOtherTabs) {
    window.toastBroadcastChannel.postMessage({
      type: "error",
      messageText,
      duration,
    });
  }
};
toast.warn = (messageText, duration, notifyOtherTabs) => {
  message.warn(messageText);
  if (notifyOtherTabs) {
    window.toastBroadcastChannel.postMessage({
      type: "warn",
      messageText,
      duration,
    });
  }
};
toast.loading = (messageText, duration, notifyOtherTabs) => {
  message.loading(messageText, duration);
  if (notifyOtherTabs) {
    window.toastBroadcastChannel.postMessage({
      type: "loading",
      messageText,
      duration,
    });
  }
};

toast.hide = (key) => {
  message.destroy(key);
};
