import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { NativeError } from "@adapters/erros";
import { ErrorSeverity } from "@adapters/erros";
import { Logger } from "@adapters/lib";
import { getActiveWorkspace } from "@adapters/store/workspace";
import { WorkspaceType } from "@adapters/workspace";

import { prepareError, sendErrorToSentry } from "@v2/utils/sentryUtils";

interface Props {
  children: React.ReactNode;
  defaultTags?: Record<string, string>;
  boundaryId: string;
}

interface State {
  showBoundary: boolean;
  error: NativeError | null;
}

const ErrorBoundaryWrapper = (props: Props): React.JSX.Element => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const errorBoundaryRef = useRef<ErrorBoundary>(null);

  useEffect(() => {
    if (errorBoundaryRef.current !== null) {
      errorBoundaryRef.current.setState({ showBoundary: false, error: null });
    }
  }, [activeWorkspace.id]);

  const defaultTags = useMemo(() => {
    const tags: Record<string, string> = {};
    if (activeWorkspace.workspaceType === WorkspaceType.LOCAL) {
      tags["source"] = "local_fs";
    }
    return tags;
  }, [activeWorkspace.workspaceType]); // Only create new object when workspaceType changes

  return <ErrorBoundary ref={errorBoundaryRef} {...props} defaultTags={defaultTags} />;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showBoundary: false, error: null };
  }

  public static getDerivedStateFromError(error: Error | NativeError): State {
    // Error Boundary only renders NativeErrors. So converting the crash to a NativeError first
    return { showBoundary: true, error: prepareError(error, ErrorSeverity.FATAL) };
  }

  public componentDidMount(): void {
    globalUnhandledRejectionHandlers?.add(this.promiseRejectionHandler);
  }

  public componentWillUnmount(): void {
    globalUnhandledRejectionHandlers?.delete(this.promiseRejectionHandler);
  }

  public componentDidCatch(error: Error | NativeError): void {
    Logger.log("[ErrorBoundary] Crash componentDidCatch", error, this.props.boundaryId);
    sendErrorToSentry(
      error,
      this.props.boundaryId,
      "componentDidCatch",
      ErrorSeverity.FATAL,
      true,
      this.props.defaultTags
    );
  }

  public render(): React.ReactNode {
    // Only show error screen if the error is a NativeError
    if (this.state.showBoundary && this.state.error instanceof NativeError) {
      const error = this.state.error;

      Logger.log("[ErrorBoundary] Boundary Shown", { severity: error.severity });
      if (error.severity === ErrorSeverity.FATAL) {
        return <>Error</>;
      } else if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.WARNING) {
        return <>{this.props.children}</>;
      }
    }

    return this.props.children;
  }

  private readonly promiseRejectionHandler = (event: PromiseRejectionEvent & { _caughtBy?: string }): void => {
    const error: Error | NativeError =
      typeof event.reason === "string" ? new Error(event.reason) : (event.reason as Error | NativeError);

    if (error instanceof NativeError) {
      // Already caught by another error boundary
      if (event._caughtBy) {
        return;
      } else {
        Logger.log("[ErrorBoundary] uncaught promise rejection", event, event._caughtBy, this.props.boundaryId);

        const showBoundary = error.showBoundary || false;
        sendErrorToSentry(
          error,
          this.props.boundaryId,
          "onunhandledrejection",
          undefined,
          showBoundary,
          this.props.defaultTags
        );
        this.setState({ showBoundary, error: error });

        event._caughtBy = this.props.boundaryId;
        event.stopImmediatePropagation();
      }
    } else {
      // Non Native Errors to be captured by the global unhandled rejection handler
      return;
    }
  };
}

export default ErrorBoundaryWrapper;
