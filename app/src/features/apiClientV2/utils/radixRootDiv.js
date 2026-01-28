/**
 * Utility for managing the root div used by Radix components
 *
 * This creates a dedicated container for Radix UI portals (Dialog, Popover, Select, etc.)
 * that has the .bs-ds-scope class, ensuring all portal content receives proper
 * Tailwind styling without affecting Ant Design components.
 *
 * Based on approach from browserstack/browserstack-fe
 * @see https://github.com/browserstack/browserstack-fe/commit/608012e1700b1fdfde4472ba5c7867d87000498a
 */

/**
 * Appends a Radix root div to the document body with the bs-ds-scope class.
 * This should be called once during app initialization.
 *
 * @example
 * // In main.jsx or app entry point
 * import { appendRadixRootDiv } from 'features/apiClientV2/utils/radixRootDiv';
 * appendRadixRootDiv();
 */
export const appendRadixRootDiv = () => {
  const radixRootDiv = document.createElement('div');
  radixRootDiv.className = 'bs-ds-scope bs-radix-portal-root';
  radixRootDiv.id = 'bs-radix-portal-root';
  document.body.appendChild(radixRootDiv);
};

/**
 * Returns the Radix root div container, if it exists.
 * This should be passed to Radix components via their `container` prop.
 *
 * @returns {HTMLElement|undefined} The Radix portal container element
 *
 * @example
 * // In components using Radix portals
 * import { getRadixRootDiv } from 'features/apiClientV2/utils/radixRootDiv';
 *
 * <Popover container={getRadixRootDiv()}>
 *   {children}
 * </Popover>
 *
 * <Dialog container={getRadixRootDiv()}>
 *   {children}
 * </Dialog>
 *
 * <SelectMenu container={getRadixRootDiv()}>
 *   {children}
 * </SelectMenu>
 */
export const getRadixRootDiv = () => {
  return document.getElementById('bs-radix-portal-root');
};
