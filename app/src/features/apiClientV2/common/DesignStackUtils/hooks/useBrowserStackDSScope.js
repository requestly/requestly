import React, { useEffect, useState } from 'react';

/**
 * useBrowserStackDSScope - Hook to detect if component is within BrowserStack DS scope
 *
 * This hook can be useful for conditional styling or behavior based on whether
 * a component is rendered within a BrowserStack DS wrapper.
 *
 * @returns {boolean} - True if component is within .bs-ds-scope wrapper
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const isBSDSScope = useBrowserStackDSScope();
 *
 *   return (
 *     <div>
 *       {isBSDSScope ? 'Using BrowserStack DS' : 'Using Ant Design'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBrowserStackDSScope() {
  const [isInScope, setIsInScope] = useState(false);

  useEffect(() => {
    // Get the current element's parents to check for .bs-ds-scope
    const checkScope = (element) => {
      if (!element) return false;
      if (element.classList.contains('bs-ds-scope')) return true;
      return checkScope(element.parentElement);
    };

    // Use a ref or the current script's parent to determine scope
    const currentElement = document.currentScript;
    setIsInScope(checkScope(currentElement));
  }, []);

  return isInScope;
}

/**
 * withBSDSScopeCheck - HOC that passes scope info as prop
 *
 * @param {React.ComponentType} Component - Component to wrap
 * @returns {React.ComponentType} Wrapped component with isInBSDSScope prop
 *
 * @example
 * ```jsx
 * function MyComponent({ isInBSDSScope }) {
 *   return <div>In scope: {isInBSDSScope}</div>;
 * }
 *
 * export default withBSDSScopeCheck(MyComponent);
 * ```
 */
export function withBSDSScopeCheck(Component) {
  return function WrappedComponent(props) {
    const isInBSDSScope = useBrowserStackDSScope();
    return <Component {...props} isInBSDSScope={isInBSDSScope} />;
  };
}
