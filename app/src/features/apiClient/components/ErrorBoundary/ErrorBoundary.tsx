import React from "react";
import { FsAccessError } from "../../helpers/modules/sync/local/FsError/FsAccessError";
import { RQButton } from "lib/design-system-v2/components";
import { FsAccessTroubleshoot } from "./components/FsAccessTroubleshoot";
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

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({ hasError: true, error: event.reason });
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private showCustomErrorGuide(error: any) {
    if (error instanceof FsAccessError) {
      return <FsAccessTroubleshoot error={error} />;
    }
    return null;
  }

  private getErrorHeading(error: any) {
    if (error instanceof FsAccessError) {
      return "Permission denied: Unable to access the file";
    }
    return "Oops! Something went wrong.";
  }

  private handleRedirectionToHome = () => {};

  render() {
    if (this.state.hasError) {
      const error = this.state.error;

      return (
        <div className="api-client-error-boundary-view">
          <div className="api-client-error-boundary-content">
            <img src="/assets/media/apiClient/request-error.svg" alt="Error screen" />
            <div className="api-client-error-boundary-content__body">
              <div className="error-boundary__header">{this.getErrorHeading(error)}</div>
              <div className="error-boundary__subheading">{error?.message || "An unexpected error occurred"}</div>
            </div>
            {this.showCustomErrorGuide(error)}
            <div className="error-boundary__contact">
              If the issue persists, contact <a href="mailto:contact@requestly.io">support</a>
            </div>
            <div className="error-boundary__actions">
              <RQButton onClick={this.handleRedirectionToHome}>Back to home</RQButton>
              <RQButton type="primary" onClick={() => window.location.reload()}>
                Reload
              </RQButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
