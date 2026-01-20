export function getQueryParamsAsMap() {
  let queryParams = {};
  var params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    queryParams[key] = value;
  });
  return queryParams;
}

export const getRouteFromCurrentPath = (path) => {
  // only taking maximum of 2 subroutes
  const significantPathParts = path.split("/").slice(0, 3);
  const route = significantPathParts.join("/");
  return route;
};

export const prefixUrlWithHttps = (url) => {
  let newUrl = url.trim();
  if (newUrl && !newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
    newUrl = "https://" + newUrl;
  }
  return newUrl;
};

export const getDomainFromURL = (url) => {
  if (!url) return "";
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    // If URL parsing fails, return empty string
    return "";
  }
};
