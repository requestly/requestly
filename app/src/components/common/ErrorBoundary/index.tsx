import React from "react";
import { trackErrorBoundaryShown } from "modules/analytics/events/common/error-boundaries";

type Props = {
  fallback: React.ReactNode;
  children?: React.ReactNode;
};

type State = {
  isError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { isError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    trackErrorBoundaryShown(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.isError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
