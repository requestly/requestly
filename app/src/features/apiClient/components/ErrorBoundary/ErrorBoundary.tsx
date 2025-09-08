/* global globalUnhandledRejectionHandlers */
import React, { useEffect, useRef } from "react";
import { RenderableError } from "../../../../errors/RenderableError";
import { RQButton } from "lib/design-system-v2/components";
import * as Sentry from "@sentry/react";
import "./errorboundary.scss";
import { NativeError } from "errors/NativeError";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { isDesktopMode } from "utils/AppUtils";
import { Alert } from "antd";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { WorkspaceType } from "features/workspaces/types";

interface Props {
  children: React.ReactNode;
  defaultTags?: Record<string, string>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function sendErrorToSentry(error: Error, defaultTags?: Record<string, string>) {
  Sentry.withScope((scope) => {
    scope.setTag("caught_by", "api_client_error_boundary");
    if (defaultTags) {
      for (const key in defaultTags) {
        scope.setTag(key, defaultTags[key]);
      }
    }
    if (error instanceof NativeError) {
      scope.setExtra("details", error.details);
    }
    Sentry.captureException(error);
  });
}

function decorateErrorForSentry(error: Error & { tags?: Record<string, string> }) {
  error.tags = { ...error.tags, caught_by: "api_client_error_boundary" };
}

function createError(message?: string) {
  return new Error(message || "An unexpected error occurred");
}

function sanitizeError(rawError: any) {
  if (rawError === undefined || rawError === null) {
    return createError();
  }
  if (rawError.message && rawError.stack) {
    return rawError as Error;
  }
  const error = createError();
  if (rawError.message) {
    error.message = rawError.message;
  }
  if (rawError.stack) {
    error.stack = rawError.stack;
  }

  return error;
}

const ErrorBoundaryWrapper = (props: Props) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const errorBoundaryRef = useRef<ApiClientErrorBoundary>(null);
  useEffect(() => {
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.setState({ hasError: false, error: null });
    }
  }, [activeWorkspace?.id]);

  let defaultTags: Record<string, string> = {};
  if (activeWorkspace?.workspaceType === WorkspaceType.LOCAL) {
    defaultTags = {
      ...defaultTags,
      source: "local_fs",
    };
  }

  return <ApiClientErrorBoundary ref={errorBoundaryRef} {...props} defaultTags={defaultTags} />;
};

class ApiClientErrorBoundary extends React.Component<Props, State> {
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

  componentDidCatch(error: unknown) {
    sendErrorToSentry(sanitizeError(error), this.props.defaultTags);
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    const error = typeof event.reason === "string" ? { message: event.reason } : event.reason;
    const sanitizedError = sanitizeError(error);
    decorateErrorForSentry(sanitizedError);
    this.setState({ hasError: true, error: sanitizedError });
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: sanitizeError(error) };
  }

  private getCustomError(error: any) {
    if (error instanceof RenderableError) {
      return error.render();
    }
    return null;
  }

  private getErrorHeading(error: any) {
    const defaultHeading = "Oops! Something went wrong.";
    if (error instanceof RenderableError) {
      return error.getErrorHeading() || defaultHeading;
    }
    return defaultHeading;
  }

  private handleGoBack = () => {
    getTabServiceActions().resetTabs(true);
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;

      return (
        <div className="api-client-error-boundary-view">
          <div className="api-client-error-boundary-content">
            <img src="/assets/media/apiClient/request-error.svg" alt="Error screen" />
            <div className="api-client-error-boundary-content__body">
              <div className="error-boundary__header">{this.getErrorHeading(error)}</div>
              <div className="error-boundary__error-message">
                <code>{error.message}</code>
              </div>
            </div>
            {this.getCustomError(error)}
            {isDesktopMode() ? <Alert type="warning" message="Try restarting the app to fix this issue." /> : null}
            <div className="error-boundary__contact">
              If the issue persists, contact <a href="mailto:contact@requestly.io">support</a>
            </div>
            <div className="error-boundary__actions">
              <RQButton
                onClick={() => {
                  getTabServiceActions().resetTabs(true);
                  window.location.reload();
                }}
              >
                Reload
              </RQButton>
              <RQButton type="primary" onClick={this.handleGoBack}>
                Go Back
              </RQButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
