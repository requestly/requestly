import React from "react";
import { HostContextImpl, HostContext } from "hooks/useHostContext";

/**
 * Creates a minimal HostContext for modal usage.
 * Modal is always "active" when open, and other tab operations are no-ops.
 */
export const createModalHostContext = (onClose?: () => void): HostContext => ({
  close: () => {
    onClose?.();
  },
  replace: () => {
    // No-op in modal context
  },
  getIsActive: () => true, // Modal is always active when open
  getSourceId: () => undefined,
  getBufferId: () => undefined,
  registerWorkflow: () => {
    // No-op in modal context
  },
  registerSecondaryBuffer: () => {
    // No-op in modal context
  },
  unregisterSecondaryBuffer: () => {
    // No-op in modal context
  },
});

/**
 * Provider component that wraps children with a fake modal host context.
 */
export const FakeModalHostContextProvider: React.FC<
  React.PropsWithChildren<{ onClose?: () => void }>
> = ({ children, onClose }) => {
  return <HostContextImpl.Provider value={createModalHostContext(onClose)}>{children}</HostContextImpl.Provider>;
};
