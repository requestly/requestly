export enum ErrorCode {
  PERMISSION_DENIED = "permission_denied",
  UNKNOWN = "unknown",
}

export enum ErrorSeverity {
  FATAL = "fatal", // Shows Blocking UI
  WARNING = "warning", // Shows Non-Blocking UI/Notification
  DEBUG = "debug", // Captured but not shown to the user (To be triaged)
  INFO = "info", // Captured but not shown to the user (Can be ignored)
}
