export enum ErrorCode {
  WrongInput = "wrong_input",
  PermissionDenied = "permission_denied",
  NotPermitted = "not_permitted",
  MigrationFailed = "migration_failed",
  EntityAlreadyExists = "entity_already_exists",
  NotFound = "not_found",
  UNKNOWN = "unknown",
}

// Contains the value from Sentry.SeverityLevel
export enum ErrorSeverity {
  FATAL = "fatal",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  DEBUG = "debug",
}
