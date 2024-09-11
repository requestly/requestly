import { ProxyDetails, removeProxy } from "./proxy";

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
      removeProxy();
      socket = null;
    };
  });
};

export const sendMessage = (message: Record<string, any>, awaitResponse = false) => {
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

  // Handle messages from desktop app
  // switch (message.action) {
  // }
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
  }
};

export const getProxyDetails = async (): Promise<ProxyDetails | null> => {
  return sendMessage({ action: "get_proxy" }, true)
    .then((response: any) => {
      console.log("!!!Received proxy info", response);
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
