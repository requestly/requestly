import React, { ErrorInfo } from "react";
import { trackErrorBoundaryShown } from "modules/analytics/events/common/error-boundaries";

type Props<T = React.ReactNode> = {
  fallback: T;
  children?: T;
};

type State = {
  isError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { isError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { message } = error;
    const { componentStack } = errorInfo;

    trackErrorBoundaryShown(message, componentStack?.slice(0, 200));
  }

  render(): React.ReactNode {
    if (this.state.isError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
