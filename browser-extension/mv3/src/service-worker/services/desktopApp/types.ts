export interface WebSocketMessage {
  type?: string;
  action?: string;
  source?: string;
  appId?: string;
  payload?: any;
}

export interface ProxyDetails {
  proxyPort: number;
  proxyIp: string;
  proxyUrl: string;
}
