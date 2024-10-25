import { EXTENSION_MESSAGES } from "common/constants";
import { sendMessageToApp } from "./messageHandler";
import { applyProxy, ProxyDetails, removeProxy } from "./proxy";
import { toggleExtensionStatus } from "./utils";

let socket: WebSocket = null;

const DESKTOP_APP_SOCKET_SERVER_PORT = 59763;
const DESKTOP_APP_SOCKET_URL = `ws://127.0.0.1:${DESKTOP_APP_SOCKET_SERVER_PORT}`;
const DESKTOP_APP_SERVER_URL = `http://127.0.0.1:${DESKTOP_APP_SOCKET_SERVER_PORT}`;

const connectToDesktopApp = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      resolve(true);
      return;
    }

    socket = new WebSocket(DESKTOP_APP_SOCKET_URL);

    socket.onopen = function () {
      console.log("WebSocket connection opened");
      resolve(true);
    };

    socket.onmessage = function (event) {
      handleMessage(event.data);
    };

    socket.onerror = function (error) {
      console.error("WebSocket error: ", error);
      resolve(false);
      disconnectFromDesktopAppAndRemoveProxy();
    };

    socket.onclose = function () {
      console.log("WebSocket connection closed");
      disconnectFromDesktopAppAndRemoveProxy();
      socket = null;
    };
  });
};

const handleMessage = (data: any) => {
  const message = JSON.parse(data);
  if (message.source !== "desktop-app") return;

  switch (message.action) {
    case "heartbeat":
      // https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle#chrome_116
      // Active WebSocket connections extend extension service worker lifetimes
      break;
    case "disconnect-extension":
      disconnectFromDesktopAppAndRemoveProxy();
      break;
    default:
      console.log("Unknown action extension:", message.action);
  }
};

export const sendMessageToDesktopApp = (message: Record<string, any>, awaitResponse = false) => {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ ...message, source: "extension" }));

      if (awaitResponse) {
        const handleMessage = (event: MessageEvent) => {
          const response = JSON.parse(event.data);
          if (response.source === "desktop-app" && response.action === message.action) {
            resolve(response);
            socket.removeEventListener("message", handleMessage);
          }
        };
        socket.addEventListener("message", handleMessage);
      } else {
        resolve(null);
      }
    } else {
      reject("WebSocket is not open, cannot send message");
    }
  });
};

export const connectToDesktopAppAndApplyProxy = async () => {
  const isConnected = await connectToDesktopApp();

  if (!isConnected) {
    return false;
  }

  const proxyDetails = await getProxyDetails();
  await applyProxy(proxyDetails);

  sendMessageToApp({
    action: EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED,
    payload: true,
  });

  sendMessageToDesktopApp({
    action: "browser-connected",
    appId: getConnectedBrowserAppId(),
  });

  toggleExtensionStatus(false);
  return true;
};

export const disconnectFromDesktopAppAndRemoveProxy = async () => {
  try {
    await sendMessageToDesktopApp({ action: "browser-disconnected", appId: getConnectedBrowserAppId() });
    sendMessageToApp({
      action: EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED,
      payload: false,
    });
    socket.close();
  } catch (e) {
    console.log("Error sending message to desktop app socket closed");
    removeProxy();
    toggleExtensionStatus(true);
  }
  return true;
};

export const checkIfDesktopAppOpen = async (): Promise<boolean> => {
  return fetch(DESKTOP_APP_SERVER_URL)
    .then(() => true)
    .catch(() => false);
};

const getProxyDetails = async (): Promise<ProxyDetails | null> => {
  return sendMessageToDesktopApp({ action: "get-proxy" }, true)
    .then((response: any) => {
      const proxyPort = response.proxyPort;
      return {
        proxyPort: proxyPort,
        proxyIp: "127.0.0.1",
        proxyUrl: `http://127.0.0.1:${proxyPort}`,
      };
    })
    .catch((error) => {
      console.error("Error getting proxy info", error);
      return null;
    });
};

const getConnectedBrowserAppId = () => {
  const userAgent = navigator.userAgent?.toLowerCase();
  //@ts-ignore
  const userAgentData = navigator.userAgentData?.brands?.map((brand) => brand.brand);

  if (!userAgent) {
    return "existing-browser";
  }

  switch (true) {
    case userAgent.includes("firefox"):
      return "existing-firefox";
    case userAgent.includes("edg/"):
      return "existing-edge";
    case userAgent.includes("opr") || userAgent.includes("opera"):
      return "existing-opera";
    //@ts-ignore
    case navigator.brave || userAgent.includes("brave") || userAgentData.includes("Brave"):
      return "existing-brave";
    case userAgent.includes("chrome"):
      if (userAgentData.includes("Google Chrome")) {
        return "existing-chrome";
      } else {
        return "existing-chromium";
      }
    default:
      return "existing-browser";
  }
};
