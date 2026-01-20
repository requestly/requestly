// Open terminal and type `node --print "http.STATUS_CODES"` to get all codes
// Extra codes added from -- https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
export const statusCodes = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",

  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",

  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  419: "Page Expired", // Specific to php Laravel
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  // NGINX 4xx responses
  444: "No Response",
  494: "Request header too large",
  495: "SSL Certificate Error",
  496: "SSL Certificate Required",
  497: "HTTP Request Sent to HTTPS Port",
  499: "Client Closed Request",

  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended",
  511: "Network Authentication Required",
  // Cloudflare errros
  520: "Web Server Returned an Unknown Error",
  521: "Web Server Is Down",
  522: "Connection Timed Out",
  523: "Origin Is Unreachable",
  524: "A Timeout Occurred",
  525: "SSL Handshake Failed",
  526: "Invalid SSL Certificate",
  527: "Railgun Error",
};

const statusCodesGroupedByCategory = {
  "1xx": {
    label: "1xx INFORMATIONAL",
    codes: [],
  },
  "2xx": {
    label: "2xx SUCCESS",
    codes: [],
  },
  "3xx": {
    label: "3xx REDIRECTION",
    codes: [],
  },
  "4xx": {
    label: "4xx CLIENT ERROR",
    codes: [],
  },
  "5xx": {
    label: "5xx SERVER ERROR",
    codes: [],
  },
};

Object.keys(statusCodes).forEach((code) => {
  const codeCategory = code.charAt(0) + "xx";
  statusCodesGroupedByCategory[codeCategory].codes.push(code);
});

export const STATUS_CODE_OPTIONS = Object.values(statusCodesGroupedByCategory).map(({ label, codes }) => {
  return {
    label,
    options: codes.map((code) => {
      return { value: code, label: `${code} - ${statusCodes[code]}`, id: code };
    }),
  };
});

export const STATUS_CODE_ONLY_OPTIONS = Object.values(statusCodesGroupedByCategory).map(({ label, codes }) => {
  return {
    label,
    options: codes.map((code) => {
      return { value: code, label: code, id: code };
    }),
  };
});

export const STATUS_CODE_LABEL_ONLY_OPTIONS = Object.values(statusCodesGroupedByCategory).map(({ label }) => {
  return {
    label,
    value: label,
  };
});
