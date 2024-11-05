import { EXTENSION_MESSAGES } from "common/constants";
import { sendMessageToApp } from "./messageHandler";
import { applyProxy, ProxyDetails, removeProxy } from "./proxy";
import { toggleExtensionStatus } from "./utils";
import extensionIconManager from "./extensionIconManager";

const DEFAULT_DESKTOP_APP_SOCKET_SERVER_PORT = 59763;
const BASE_IP = "127.0.0.1";

let socket: WebSocket = null;
let activePort: number = null;

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

  toggleExtensionStatus(false);
  extensionIconManager.markConnectedToDesktopApp();

  sendMessageToDesktopApp({
    action: "browser-connected",
    appId: getConnectedBrowserAppId(),
  });

  return true;
};

export const disconnectFromDesktopAppAndRemoveProxy = async () => {
  try {
    await sendMessageToDesktopApp({ action: "browser-disconnected", appId: getConnectedBrowserAppId() });
    sendMessageToApp({
      action: EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED,
      payload: false,
    });
    extensionIconManager.markDisconnectedFromDesktopApp();
    toggleExtensionStatus(true);
    socket.close();
  } catch (e) {
    console.log("Error sending message to desktop app socket closed");
    removeProxy();
    // Sending disconnect message as control enters catch when desktop app is closed as socket is closed
    sendMessageToApp({
      action: EXTENSION_MESSAGES.DESKTOP_APP_CONNECTION_STATUS_UPDATED,
      payload: false,
    });
    extensionIconManager.markDisconnectedFromDesktopApp();
    toggleExtensionStatus(true);
  }
};

export const checkIfDesktopAppOpen = async (): Promise<boolean> => {
  if (!activePort) {
    await findActivePort();
  }

  return fetch(`http://${BASE_IP}:${activePort}`)
    .then(() => true)
    .catch(() => false);
};

const connectToDesktopApp = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      resolve(true);
      return;
    }

    if (!activePort) {
      await findActivePort();
    }

    socket = new WebSocket(`ws://${BASE_IP}:${activePort}`);

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
      socket.close();
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

const findActivePort = async () => {
  const startPort = DEFAULT_DESKTOP_APP_SOCKET_SERVER_PORT;
  const endPort = DEFAULT_DESKTOP_APP_SOCKET_SERVER_PORT + 4;

  try {
    const isStartPortActive = await checkPort(startPort);
    if (isStartPortActive) {
      console.log(`Server found on default port ${startPort}`);
      activePort = startPort;
      return;
    }
  } catch (err) {
    console.log(`Default port ${startPort} not available`);
  }

  // Scan port range for active server
  for (let port = startPort; port <= endPort; port++) {
    try {
      const isPortActive = await checkPort(port);
      if (isPortActive) {
        console.log(`Server found on port ${port}`);
        activePort = port;
        return;
      }
    } catch (err) {
      continue; // Try next port
    }
  }

  activePort = DEFAULT_DESKTOP_APP_SOCKET_SERVER_PORT;
};

async function checkPort(port: number) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${BASE_IP}:${port}`);

    // Set timeout to avoid hanging on inactive ports
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Connection timeout"));
    }, 1000);

    ws.onopen = () => {
      clearTimeout(timeout);

      // Verify it's your desktop app by sending a handshake
      ws.send(JSON.stringify({ type: "handshake" }));

      // Wait briefly for handshake response
      setTimeout(() => {
        ws.close();
      }, 100);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Verify this is your desktop app's response
        if (data.type === "handshakeResponse") {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        }
      } catch (err) {
        ws.close();
        reject(new Error("Invalid handshake response"));
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      ws.close();
      reject(new Error("Connection failed"));
    };
  });
}
