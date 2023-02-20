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
