import {
  RQNetworkLog,
  RQNetworkLogType,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

interface HarMapEntry {
  name: string;
  value: string;
  comment?: string;
}

interface LogRequest {
  method: string;
  path: string;
  host: string;
  port: string;
  headers: HeaderMap;
  body: any;
  queryParams: HarMapEntry[];
}

interface LogResponse {
  statusCode: number;
  headers: HeaderMap;
  contentType: string;
  body: string;
}

type HeaderMap = Record<string, string>; // {[name] : value}

export interface RQNetworkLogt {
  id: string;
  timestamp: number;
  url: string;
  request: LogRequest;
  response: LogResponse;
  requestShellCurl: string;
  requestState: string;
  actions: any; // array of applied actions
  consoleLogs: any; // array of logs generated in script based rules
  domain?: string;
  app?: string;
}

export const mockRQNetworkLogs: RQNetworkLog[] = [
  {
    id: "1",
    logType: RQNetworkLogType.SESSION_RECORDING,
    timestamp: "00:01",
    url: `
    https://bam.nr-data.net/jserrors/1/NRJS-dd5f16cdf95712c6cba?a=1588759528&sa=1&v=1.236.0&t=Unnamed%20Transaction&rst=7456875&ck=0&s=376c478a41bdb377&ref=https://www.flipkart.com/&ri=%7B%22fk-cp-zion%22:%225.44.1%22%7D`,
    request: {
      method: "GET",
      path: "/",
      host: "www.google.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "2",
    logType: RQNetworkLogType.SESSION_RECORDING,
    timestamp: "00:02",
    url: `
    https://bam.nr-data.net/jserrors/1/NRJS-dd5f16cdf95712c6cba?a=1588759528&sa=1&v=1.236.0&t=Unnamed%20Transaction&rst=7456875&ck=0&s=376c478a41bdb377&ref=https://www.flipkart.com/&ri=%7B%22fk-cp-zion%22:%225.44.1%22%7D`,
    request: {
      method: "GET",
      path: "/",
      host: "www.amazon.com",
      port: "443",
      headers: {
        server: "nginx",
        "content-type": "text/html; charset=utf-8",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "3",
    timestamp: "00:03",
    url: `
    https://bam.nr-data.net/jserrors/1/NRJS-dd5f16cdf95712c6cba?a=1588759528&sa=1&v=1.236.0&t=Unnamed%20Transaction&rst=7456875&ck=0&s=376c478a41bdb377&ref=https://www.flipkart.com/&ri=%7B%22fk-cp-zion%22:%225.44.1%22%7D`,
    request: {
      method: "GET",
      path: "/",
      host: "www.flipkart.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "4",
    timestamp: "00:04",
    url: "https://www.netflix.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.netflix.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    consoleLogs: "consoleLogs",
  },
  {
    id: "5",
    timestamp: "00:05",
    url: "https://www.myntra.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.myntra.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "1",
    timestamp: "00:01",
    url: "https://www.google.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.google.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "2",
    timestamp: "00:02",
    url: "https://www.amazon.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.amazon.com",
      port: "443",
      headers: {
        server: "nginx",
        "content-type": "text/html; charset=utf-8",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "3",
    timestamp: "00:03",
    url: "https://www.flipkart.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.flipkart.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "4",
    timestamp: "00:04",
    url: "https://www.netflix.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.netflix.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    consoleLogs: "consoleLogs",
  },
  {
    id: "5",
    timestamp: "00:05",
    url: "https://www.myntra.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.myntra.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "1",
    timestamp: "00:01",
    url: "https://www.google.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.google.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "2",
    timestamp: "00:02",
    url: "https://www.amazon.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.amazon.com",
      port: "443",
      headers: {
        server: "nginx",
        "content-type": "text/html; charset=utf-8",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "3",
    timestamp: "00:03",
    url: "https://www.flipkart.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.flipkart.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
  {
    id: "4",
    timestamp: "00:04",
    url: "https://www.netflix.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.netflix.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    consoleLogs: "consoleLogs",
  },
  {
    id: "5",
    timestamp: "00:05",
    url: "https://www.myntra.com",
    request: {
      method: "GET",
      path: "/",
      host: "www.myntra.com",
      port: "443",
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
        date: "Wed, 23 Aug 2023 05:27:09 GMT",
      },
      body: "",
      queryParams: [],
    },
    response: {
      statusCode: 200,
      headers: {
        server: "nginx",
        "transfer-encoding": "chunked",
        "content-type": "text/html; charset=utf-8",
      },

      contentType: "text/javascript",
      body: `!function(e){function a(a){for(var t,i,o=a[0],d=a[1],l=a[2],f=0,b="}`,
    },
    requestShellCurl: "curl",
    requestState: "state",
    actions: "actions",
    consoleLogs: "consoleLogs",
  },
];
