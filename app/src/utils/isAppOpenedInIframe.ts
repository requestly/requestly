export const isAppOpenedInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // Browsers can block access to window.top due to same origin policy.
    return true;
  }
};
