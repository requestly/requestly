export const updateUrlPath = (path: string) => {
  window.history.pushState({}, "", path);
};
