import { applyProxy, ProxyDetails, removeProxy } from "./proxy";
import { toggleExtensionStatus } from "./utils";

let socket: WebSocket = null;

const DESKTOP_APP_SOCKET_PORT = 59763;
const DESKTOP_APP_SOCKET_URL = `ws://127.0.0.1:${DESKTOP_APP_SOCKET_PORT}`;

export const connectToDesktopApp = (): Promise<boolean> => {
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
    };

    socket.onclose = function () {
      console.log("WebSocket connection closed");
      disconnectExtensionAndNotifyApp();
      socket = null;
    };
  });
};

export const sendMessageToDesktopApp = (message: Record<string, any>, awaitResponse = false) => {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ ...message, source: "extension", id: chrome.runtime.id }));

      if (awaitResponse) {
        const handleMessage = (event: MessageEvent) => {
          const response = JSON.parse(event.data);
          if (
            response.id === chrome.runtime.id &&
            response.source === "desktop-app" &&
            response.action === message.action
          ) {
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

const handleMessage = (data: any) => {
  const message = JSON.parse(data);
  if (message.id !== chrome.runtime.id || message.source !== "desktop-app") return;

  switch (message.action) {
    case "heartbeat":
      // https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle#chrome_116
      // Active WebSocket connections extend extension service worker lifetimes
      break;
    case "disconnect-extension":
      disconnectExtensionAndNotifyApp();
      break;
    default:
      console.log("Unknown action:", message.action);
  }
};

export const disconnectExtensionAndNotifyApp = async () => {
  await sendMessageToDesktopApp({ action: "browser_disconnected", appId: getConnectedBrowserAppId() });
  if (socket) {
    socket.close();
  } else {
    // To be safe, remove proxy if socket is not open and proxy exists
    removeProxy();
  }
  toggleExtensionStatus(true);
};

export const getProxyDetails = async (): Promise<ProxyDetails | null> => {
  return sendMessageToDesktopApp({ action: "get_proxy" }, true)
    .then((response: any) => {
      const proxyPort = response.proxyPort;
      return {
        proxyPort: proxyPort,
        proxyIp: "127.0.0.1",
        proxyUrl: `http://127.0.0.1:${proxyPort}`,
      };
    })
    .catch((error) => {
      console.error("!!!Error getting proxy info", error);
      return null;
    });
};

export const checkIfDesktopAppOpen = async (): Promise<boolean> => {
  return fetch(`http://127.0.0.1:${DESKTOP_APP_SOCKET_PORT}`)
    .then(() => true)
    .catch(() => false);
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

export const applyProxyAndNotifyApp = async () => {
  try {
    const proxyDetails = await getProxyDetails();
    if (proxyDetails) {
      await applyProxy(proxyDetails);
      sendMessageToDesktopApp({
        action: "browser_connected",
        appId: getConnectedBrowserAppId(),
      });
      toggleExtensionStatus(false);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
