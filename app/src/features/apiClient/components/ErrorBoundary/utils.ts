import * as Sentry from "@sentry/react";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";

export function sendErrorToSentry(
  error: Error,
  errorBoundaryId: string = "error_boundary",
  defaultTags: Record<string, string> = {}
) {
  Sentry.withScope((scope) => {
    console.log("[ErrorBoundary] sendErrorToSentry", { error, boundaryId: errorBoundaryId });
    scope.setTags({ caught_by: `${errorBoundaryId}`, ...defaultTags });

    if (error instanceof NativeError && error.context) {
      console.log("[ErrorBoundary] sendErrorToSentry adding extras");
      scope.setExtras({ ...error.context });
    }
    Sentry.captureException(error);
  });
}

export function createError(message?: string, stack?: string, severity?: ErrorSeverity): NativeError {
  const err = new NativeError(message || "An unexpected error occurred");
  if (severity) err.setSeverity(severity);
  if (stack) err.stack = stack;

  return err;
}

export function prepareError<T extends NativeError = NativeError>(
  rawError: Error | T | undefined | null,
  modifiedSeverity?: ErrorSeverity
): T | NativeError {
  if (!rawError) {
    console.log("[ErrorBoundary] prepareError: rawError is undefined or null");
    return createError(undefined, undefined, modifiedSeverity);
  } else if (rawError instanceof NativeError) {
    console.log("[ErrorBoundary] prepareError: rawError is NativeError");
    if (modifiedSeverity) {
      console.log("[ErrorBoundary] prepareError: setting severity to", modifiedSeverity);
      rawError.setSeverity(modifiedSeverity);
    }
    return rawError;
  } else {
    console.log("[ErrorBoundary] prepareError: rawError is Error");
    return createError(rawError.message, rawError.stack, modifiedSeverity);
  }
}

export function getErrorPresentationDetails(error: NativeError | Error): {
  heading: string;
  subheading: string;
} {
  function getHeading(error: NativeError | Error): string {
    if (error instanceof NativeError) {
      return `${error.constructor.name}: ${error.errorCode}`;
    }

    return "Oops! Something went wrong.";
  }

  function getSubheading(error: NativeError | Error): string {
    return error.message || "";
  }

  return {
    heading: getHeading(error),
    subheading: getSubheading(error),
  };
}

