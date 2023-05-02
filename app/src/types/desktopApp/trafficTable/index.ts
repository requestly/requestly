// TODO: @wrongsahil, use these types in desktopTrafficTableLogs Slice

export interface NetworkLogEvent {
  type: string; // request, request_end, response_end
  data: NetworkLog;
}

export type NetworkLog = HttpLog;

export interface BaseNetworkLog {
  actions: any[]; // Array of rules applies
}

export interface HttpLog extends BaseNetworkLog {
  har: any;
}
