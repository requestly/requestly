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
  hasError: boolean;
  error: NativeError | null;
}

const ErrorBoundaryWrapper = (props: Props) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const errorBoundaryRef = useRef<ErrorBoundary>(null);

  useEffect(() => {
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.setState({ hasError: false, error: null });
    }
  }, [activeWorkspace?.id]);

  const defaultTags = useMemo(() => {
    const tags: Record<string, string> = {};
    if (activeWorkspace?.workspaceType === WorkspaceType.LOCAL) {
      tags.source = "local_fs";
    }
    return tags;
  }, [activeWorkspace?.workspaceType]); // Only create new object when workspaceType changes

  return (
    <ErrorBoundary boundaryId={props.boundaryId} ref={errorBoundaryRef} {...props} defaultTags={defaultTags} />
  );
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidMount(): void {
    globalUnhandledRejectionHandlers?.add(this.promiseRejectionHandler);
  }

  componentWillUnmount(): void {
    globalUnhandledRejectionHandlers?.delete(this.promiseRejectionHandler);
  }

  componentDidCatch(error: Error) {
    Logger.log("[ErrorBoundary] Crash componentDidCatch", error, this.props.boundaryId);
    sendErrorToSentry(prepareError(error, ErrorSeverity.FATAL), this.props.boundaryId, this.props.defaultTags);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: prepareError(error, ErrorSeverity.FATAL) };
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent & { _caughtBy?: string }) => {
    if (event?._caughtBy) {
      return;
    } else {
      Logger.log("[ErrorBoundary] uncaught promise rejection", event, event._caughtBy, this.props.boundaryId);
      const error = typeof event.reason === "string" ? new Error(event.reason) : event.reason;
      const finalError = prepareError(error);

      sendErrorToSentry(finalError, this.props.boundaryId, this.props.defaultTags);
      event._caughtBy = this.props.boundaryId;
      this.setState({ hasError: true, error: finalError });

      event.stopImmediatePropagation();
    }
  };

  private handleResetError = () => {
    getTabServiceActions().resetTabs(true);
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;

      Logger.log("[ErrorBoundary] Boundary Shown", { severity: error?.severity });
      if (error?.severity === ErrorSeverity.FATAL) {
        return <ErrorScreen error={error} resetError={this.handleResetError} />;
      } else if (error?.severity === ErrorSeverity.WARNING) {
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
