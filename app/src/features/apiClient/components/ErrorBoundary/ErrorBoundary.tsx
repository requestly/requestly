import React, { useEffect, useRef } from "react";
import { RenderableError } from "../../../../errors/RenderableError";
import { RQButton } from "lib/design-system-v2/components";
import * as Sentry from "@sentry/react";
import "./errorboundary.scss";
import { NativeError } from "errors/NativeError";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function sendErrorToSentry(error: Error) {
  Sentry.withScope((scope) => {
    scope.setTag("caught_by", "api_client_error_boundary");
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

  return <ApiClientErrorBoundary ref={errorBoundaryRef} {...props} />;
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
    sendErrorToSentry(sanitizeError(error));
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    const error = { message: event.reason };
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
            <div className="error-boundary__contact">
              If the issue persists, contact <a href="mailto:contact@requestly.io">support</a>
            </div>
            <div className="error-boundary__actions">
              <RQButton onClick={() => window.location.reload()}>Reload</RQButton>
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
