import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useApiClientLayout from "../useApiClientLayout";

// Mock component to test the hook
const TestComponent = (): React.ReactElement => {
  const { getSecondPaneMinSize } = useApiClientLayout();
  return (
    <div data-testid="test-component">
      <span data-testid="second-pane-size">{getSecondPaneMinSize()}</span>
    </div>
  );
};

describe("useApiClientLayout", () => {
  it("should return getSecondPaneMinSize function", () => {
    render(<TestComponent />);
    const component = screen.getByTestId("test-component");
    expect(component).toBeInTheDocument();
  });

  it("should calculate second pane minimum size", () => {
    render(<TestComponent />);
    const sizeElement = screen.getByTestId("second-pane-size");

    // The function should return a number
    const size = parseInt(sizeElement.textContent as string, 10);
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThan(0);
  });
});
