import React from 'react';
import PropTypes from 'prop-types';

/**
 * BrowserStackDSWrapper - Wrapper component for BrowserStack Design System components
 *
 * This wrapper adds the 'bs-ds-scope' class which is used in tailwind.config.js
 * with the 'important' option to ensure Tailwind utilities have proper specificity
 * within BrowserStack DS components without affecting Ant Design components.
 *
 * For Radix UI portals (dialogs, popovers, select menus), use the container prop:
 *
 * @example
 * import { getRadixRootDiv } from 'features/apiClientV2/utils/radixRootDiv';
 *
 * <BrowserStackDSWrapper>
 *   <SelectMenu container={getRadixRootDiv()}>
 *     <SelectMenuTrigger />
 *     <SelectMenuOptionGroup>...</SelectMenuOptionGroup>
 *   </SelectMenu>
 * </BrowserStackDSWrapper>
 */
export const BrowserStackDSWrapper = ({ children, className = '' }) => {
  return <div className={`bs-ds-scope ${className}`.trim()}>{children}</div>;
};

BrowserStackDSWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

BrowserStackDSWrapper.defaultProps = {
  className: ''
};
