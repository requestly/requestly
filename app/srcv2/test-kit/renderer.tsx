import type { ReactElement } from "react";
import React from "react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";

/**
 * Custom render function for testing React components in srcv2
 *
 * This function wraps components with necessary providers (Redux, Router, etc.)
 * and provides a consistent testing interface using React Testing Library.
 *
 * @example
 * ```tsx
 * import { renderWithProviders } from '@v2/test-kit/renderer';
 *
 * test('renders component', () => {
 *   const { getByText } = renderWithProviders(<MyComponent />);
 *   expect(getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  /**
   * Custom providers to wrap the component
   * @example
   * customProviders: (children) => <Provider store={store}>{children}</Provider>
   */
  customProviders?: (children: React.ReactNode) => React.ReactElement;
}

export const renderWithProviders = (
  ui: ReactElement,
  { customProviders, ...renderOptions }: CustomRenderOptions = {}
): RenderResult => {
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    if (customProviders != null) {
      return customProviders(children);
    }
    return <>{children}</>;
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Helper function to create a mock component for testing
 *
 * @example
 * ```tsx
 * vi.mock('@v2/components/Button', () => ({
 *   Button: createMockComponent('Button'),
 * }));
 * ```
 */
export const createMockComponent = (name: string): React.FC<any> => {
  const MockComponent: React.FC<any> = ({ children, ...props }) => (
    <div data-testid={`mock-${name.toLowerCase()}`} {...props}>
      {children}
    </div>
  );
  MockComponent.displayName = `Mock${name}`;
  return MockComponent;
};
