import {
  RQNetworkLog,
  RQNetworkLogType,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

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
      body: "test body",
      queryParams: [
        {
          name: "a",
          value: "1588759528",
        },
        {
          name: "sa",
          value: "1",
        },
        {
          name: "v",
          value: "1.236.0",
        },
        {
          name: "t",
          value: "Unnamed%20Transaction",
        },
        {
          name: "rst",
          value: "316879",
        },
        {
          name: "ck",
          value: "0",
        },
        {
          name: "s",
          value: "376c478a41bdb377",
        },
        {
          name: "ref",
          value: "https://www.flipkart.com/",
        },
        {
          name: "ri",
          value: "%7B%22fk-cp-zion%22:%225.44.1%22%7D",
        },
      ],
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
      queryParams: [
        {
          name: "a",
          value: "1588759528",
        },
        {
          name: "sa",
          value: "1",
        },
        {
          name: "v",
          value: "1.236.0",
        },
        {
          name: "t",
          value: "Unnamed%20Transaction",
        },
      ],
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
      queryParams: [
        {
          name: "a",
          value: "1588759528",
        },
      ],
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
      queryParams: [
        {
          name: "a",
          value: "1588759528",
        },
        {
          name: "sa",
          value: "1",
        },
        {
          name: "v",
          value: "1.236.0",
        },
        {
          name: "t",
          value: "Unnamed%20Transaction",
        },
      ],
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
