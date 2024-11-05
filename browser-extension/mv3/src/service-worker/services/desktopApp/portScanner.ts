import { DESKTOP_APP_CONFIG } from "./desktopAppConfig";

export class PortScanner {
  async findActivePort(): Promise<number> {
    const startPort = DESKTOP_APP_CONFIG.DEFAULT_PORT;
    const endPort = startPort + DESKTOP_APP_CONFIG.PORT_SCAN_RANGE;

    try {
      // Try default port first
      const isStartPortActive = await this.checkPort(startPort);
      if (isStartPortActive) {
        return startPort;
      }
    } catch (err) {
      console.log(`Default port ${startPort} not available`);
    }

    // Scan port range
    for (let port = startPort; port <= endPort; port++) {
      try {
        const isPortActive = await this.checkPort(port);
        if (isPortActive) {
          return port;
        }
      } catch {
        continue;
      }
    }

    return DESKTOP_APP_CONFIG.DEFAULT_PORT;
  }

  private checkPort(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://${DESKTOP_APP_CONFIG.BASE_IP}:${port}`);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Connection timeout"));
      }, DESKTOP_APP_CONFIG.TIMEOUTS.CONNECTION);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.send(JSON.stringify({ type: "handshake" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "handshakeResponse") {
            console.log("!!!debug", "handshakeResponse Received", event.data);
            clearTimeout(timeout);
            ws.close();
            resolve(true);
          }
        } catch {
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
}
