import React from "react";
import { RenderableError } from "./RenderableError";
import { RQButton } from "lib/design-system-v2/components";
import * as Sentry from "@sentry/react";
import "./errorboundary.scss";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ApiClientErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidMount(): void {
    window.addEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  componentWillUnmount(): void {
    window.removeEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  componentDidCatch(error: unknown) {
    Sentry.withScope((scope) => {
      scope.setTag("errorType", "api_client_error_boundary");
      Sentry.captureException(error);
    });
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({ hasError: true, error: event.reason });
    Sentry.withScope((scope) => {
      scope.setTag("errorType", "api_client_error_boundary");
      Sentry.captureException(event.reason);
    });
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private showCustomError(error: any) {
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
                {error.message ? (
                  <code>{error?.message}</code>
                ) : (
                  <div className="text-center">An unexpected error occurred</div>
                )}
              </div>
            </div>
            {this.showCustomError(error)}
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
