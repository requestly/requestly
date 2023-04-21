import { RQAPI } from "./types";

export const makeRequest = async (request: RQAPI.Request): Promise<RQAPI.Response> => {
  const method = request.method;
  const headers = new Headers();
  let url = request.url;

  if (request.queryParams.length) {
    const urlObj = new URL(request.url);
    const searchParams = new URLSearchParams(urlObj.search);
    request.queryParams.forEach(({ key, value }) => {
      searchParams.append(key, value);
    });
    urlObj.search = searchParams.toString();
    url = urlObj.toString();
  }

  request.headers.forEach(({ name, value }) => {
    headers.append(name, value);
  });

  const requestStartTime = performance.now();
  const response = await fetch(url, { method, headers });
  const responseText = await response.text();
  const responseTime = performance.now() - requestStartTime;

  const responseHeaders: RQAPI.Header[] = [];
  response.headers.forEach((value, name) => {
    responseHeaders.push({ name, value });
  });

  return {
    body: responseText,
    time: responseTime,
    headers: responseHeaders,
    status: response.status,
    statusText: response.statusText,
  };
};
