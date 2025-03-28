export const updateUrlPath = (newPath: string, preserveQueryParams = true) => {
  const currentUrl = new URL(window.location.href);
  const newUrl = new URL(window.location.href);
  newUrl.pathname = newPath;

  if (preserveQueryParams && currentUrl.search) {
    newUrl.search = currentUrl.search;
  } else {
    newUrl.search = "";
  }
  window.history.pushState({}, "", newUrl);
};
