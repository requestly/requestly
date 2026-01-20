import * as Sentry from "@sentry/react";
import { NativeError } from "errors/NativeError";
import { RenderableError } from "errors/RenderableError";
import { ErrorSeverity } from "errors/types";

export function sendErrorToSentry(
  error: NativeError | Error,
  errorBoundaryId: string,
  mechanismType: `onerror` | `onunhandledrejection` | `generic` | `componentDidCatch` | `reactRouter`,
  updatedLevel?: Sentry.SeverityLevel | undefined,
  boundaryShown: boolean = false,
  defaultTags: Record<string, string> = {},
) {
  Sentry.withScope((scope) => {
    scope.setTags({ caught_by: `${errorBoundaryId}`, ...defaultTags, boundary_shown: boundaryShown });

    const mechanism: Sentry.EventHint["mechanism"] = {
      type: mechanismType || "generic",
      handled: false,
    };

    if (error instanceof NativeError) {
      scope.setTags({ is_native_error: true });

      if (error.context) {
        scope.setExtras({ ...error.context });
      }

      if (error.severity) {
        scope.setLevel(error.severity as Sentry.SeverityLevel);
      }

      if (error instanceof RenderableError) {
        mechanism.handled = true;
      }
    }

    if (updatedLevel) {
      scope.setLevel(updatedLevel);
    }

    Sentry.captureException(error, { mechanism });
  });
}

export function createNativeError(message?: string, stack?: string, severity?: ErrorSeverity): NativeError {
  const err = new NativeError(message || "An unexpected error occurred");
  if (severity) err.setSeverity(severity);
  if (stack) err.stack = stack;

  return err;
}

export function createNativeErrorFromError(error: Error, severity?: ErrorSeverity): NativeError {
  const nativeErr = NativeError.fromError(error);
  if (severity) nativeErr.setSeverity(severity);
  return nativeErr;
}

export function prepareError<T extends NativeError = NativeError>(
  rawError: Error | T | undefined | null,
  modifiedSeverity?: ErrorSeverity
): T | NativeError {
  if (!rawError) {
    return createNativeError(undefined, undefined, modifiedSeverity);
  } else if (rawError instanceof NativeError) {
    if (modifiedSeverity) {
      rawError.setSeverity(modifiedSeverity);
    }
    return rawError;
  } else {
    return createNativeErrorFromError(rawError, modifiedSeverity);
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
