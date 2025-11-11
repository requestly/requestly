import React, { useEffect, useMemo, useRef } from "react";
import { NativeError } from "errors/NativeError";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { WorkspaceType } from "features/workspaces/types";
import { ErrorSeverity } from "errors/types";
import { ErrorScreen } from "./components/ErrorScreen";
import { ErrorNotification } from "./components/ErrorNotification";
import { sendErrorToSentry, prepareError } from "./utils";
import Logger from "lib/logger";

interface Props {
  children: React.ReactNode;
  defaultTags?: Record<string, string>;
  boundaryId: string;
}

interface State {
  showBoundary: boolean;
  error: NativeError | null;
}

const ErrorBoundaryWrapper = (props: Props) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const errorBoundaryRef = useRef<ErrorBoundary>(null);

  useEffect(() => {
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.setState({ showBoundary: false, error: null });
    }
  }, [activeWorkspace?.id]);

  const defaultTags = useMemo(() => {
    const tags: Record<string, string> = {};
    if (activeWorkspace?.workspaceType === WorkspaceType.LOCAL) {
      tags.source = "local_fs";
    }
    return tags;
  }, [activeWorkspace?.workspaceType]); // Only create new object when workspaceType changes

  return <ErrorBoundary ref={errorBoundaryRef} {...props} defaultTags={defaultTags} />;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showBoundary: false, error: null };
  }

  componentDidMount(): void {
    globalUnhandledRejectionHandlers?.add(this.promiseRejectionHandler);
  }

  componentWillUnmount(): void {
    globalUnhandledRejectionHandlers?.delete(this.promiseRejectionHandler);
  }

  componentDidCatch(error: Error | NativeError) {
    Logger.log("[ErrorBoundary] Crash componentDidCatch", error, this.props.boundaryId);
    sendErrorToSentry(
      error,
      this.props.boundaryId,
      "componentDidCatch",
      ErrorSeverity.FATAL,
      true,
      this.props.defaultTags,
    );
  }

  static getDerivedStateFromError(error: Error | NativeError): State {
    // Error Boundary only renders NativeErrors. So converting the crash to a NativeError first
    return { showBoundary: true, error: prepareError(error, ErrorSeverity.FATAL) };
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent & { _caughtBy?: string }) => {
    const error = typeof event.reason === "string" ? new Error(event.reason) : event.reason;

    if (error instanceof NativeError) {
      // Already caught by another error boundary
      if (event?._caughtBy) {
        return;
      } else {
        Logger.log("[ErrorBoundary] uncaught promise rejection", event, event._caughtBy, this.props.boundaryId);

        const showBoundary = error?.showBoundary || false;
        sendErrorToSentry(
          error,
          this.props.boundaryId,
          "onunhandledrejection",
          undefined,
          showBoundary,
          this.props.defaultTags,
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

  private handleResetError = () => {
    getTabServiceActions().resetTabs(true);
    this.setState({ showBoundary: false, error: null });
  };

  render() {
    // Only show error screen if the error is a NativeError
    if (this.state.showBoundary && this.state.error instanceof NativeError) {
      const error = this.state.error;

      Logger.log("[ErrorBoundary] Boundary Shown", { severity: error?.severity });
      if (error?.severity === ErrorSeverity.FATAL) {
        return <ErrorScreen error={error} resetError={this.handleResetError} />;
      } else if (error?.severity === ErrorSeverity.ERROR || error?.severity === ErrorSeverity.WARNING) {
        return (
          <>
            {this.props.children}
            <ErrorNotification error={error} resetError={this.handleResetError} />
          </>
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
