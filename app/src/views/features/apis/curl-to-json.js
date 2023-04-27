// Source: https://github.com/HARSHSINGH0/curl-to-json
import yargsParser from "yargs-parser";

const convertToJson = (curl_request) => {
  const cookieStrToObject = (cookieStr) => {
    let cookieObj = {};
    let keyValuePairs = cookieStr.split("; ");
    keyValuePairs.forEach((pair) => {
      let [key, value] = pair.split("=");
      cookieObj[key] = value;
    });
    return cookieObj;
  };
  const argvs = yargsParser(curl_request);

  const json = {
    headers: {},
    method: "GET",
  };

  const isJson = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const removeQuotes = (str) => str.replace(/['"]+/g, "");

  const stringIsUrl = (url) => {
    return /^(ftp|http|https|ws):\/\/[^ "]+$/.test(url);
  };

  const parseField = (string) => {
    return string.split(/: (.+)/);
  };

  const parseHeader = (header) => {
    let parsedHeader = {};
    if (Array.isArray(header)) {
      header.forEach((item, index) => {
        const field = parseField(item);
        parsedHeader[field[0]] = field[1];
      });
    } else {
      const field = parseField(header);
      parsedHeader[field[0]] = field[1];
    }

    return parsedHeader;
  };

  const parseData = (data) => {
    let jsonObj = {};
    // json.headers["Content-Type"] = "application/json";

    if (Array.isArray(data)) {
      if (isJson(data[0])) {
        data.forEach((item) => {
          const parsedItem = JSON.parse(item);
          jsonObj = {
            ...jsonObj,
            ...parsedItem,
          };
        });

        return jsonObj;
      }

      if (data[0].includes("=")) {
        return parseDataUrlEncode(data);
      }
    } else {
      if (isJson(data)) {
        return JSON.parse(data);
      }
      if (data.includes("=")) {
        return parseDataUrlEncode(data);
      }
      return data;
    }
  };

  const parseDataUrlEncode = (data) => {
    let jsonUrlEncoded = "";
    // json.headers["Content-Type"] = "application/x-www-form-urlencoded";

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (index === 0) {
          jsonUrlEncoded = encodeURI(item);
        } else {
          jsonUrlEncoded = jsonUrlEncoded + "&" + encodeURI(item);
        }
      });
      return jsonUrlEncoded;
    } else {
      return data;
    }
  };

  let authTypeUsed = false;
  let httpMethodSpecified = false;

  for (const argv in argvs) {
    switch (argv) {
      case "_":
        {
          const _ = argvs[argv];
          _.forEach((item) => {
            item = removeQuotes(item);
            if (
              typeof item == "string" &&
              item.includes(".com") &&
              !item.match(/^((http|https|ftp|ftps|sftp|ssh|scp|smb|file|s3|ws):\/\/.*)$/)
            ) {
              item = "http://" + item;
            }
            if (stringIsUrl(item)) {
              json.raw_url = item;
              const url = new URL(json.raw_url);
              const cleanUrl = url.origin + url.pathname;
              json.url = cleanUrl;

              // Check if the raw URL has any queries
              if (json.raw_url.includes("?")) {
                // Extract the query string from the URL
                const queryString = json.raw_url.split("?")[1];

                // Split the query string into individual query parameters
                const queryParams = queryString.split("&");

                json.queries = {};
                // Loop through each query parameter and add it to the queries object
                for (let i = 0; i < queryParams.length; i++) {
                  const queryParam = queryParams[i].split("=");
                  const paramName = queryParam[0];
                  const paramValue = queryParam[1];
                  json.queries[paramName] = paramValue;
                }
              }
            }
          });
        }
        break;

      case "H":
      case "header":
        {
          const parsedHeader = parseHeader(argvs[argv]);
          json.headers = {
            ...json.headers,
            ...parsedHeader,
          };
          if (parsedHeader.Cookie) {
            json.cookies = {};
            json.cookies = cookieStrToObject(parsedHeader.Cookie);
          }
        }
        break;

      case "u":
      case "user":
        // json.headers["Authorization"] = argvs[argv];
        const [username, password] = argvs[argv].split(":");
        json.auth = { user: username, pass: password };
        // var authTypeUsed = false;
        if (!authTypeUsed) {
          json.auth_type = "basic";
        }

        break;

      case "A":
      case "user-agent":
        json.headers["user-agent"] = argvs[argv];
        break;

      case "I":
      case "head":
        json.method = "HEAD";
        if (stringIsUrl(argvs[argv])) {
          json.raw_url = argvs[argv];
          const url = new URL(json.raw_url);
          const cleanUrl = url.origin + url.pathname;
          json.url = cleanUrl;

          // Check if the raw URL has any queries
          if (json.raw_url.includes("?")) {
            // Extract the query string from the URL
            const queryString = json.raw_url.split("?")[1];

            // Split the query string into individual query parameters
            const queryParams = queryString.split("&");

            json.queries = {};
            // Loop through each query parameter and add it to the queries object
            for (let i = 0; i < queryParams.length; i++) {
              const queryParam = queryParams[i].split("=");
              const paramName = queryParam[0];
              const paramValue = queryParam[1];
              json.queries[paramName] = paramValue;
            }
          }
        }

        break;

      case "b":
      case "cookie":
        json.headers["Set-Cookie"] = argvs[argv];
        if (!json.cookies) {
          json.cookies = {};
        }
        Object.assign(json.cookies, cookieStrToObject(argvs[argv]));
        break;

      case "d":
      case "data-ascii":
      case "data":
      case "data-binary":
      case "data-raw":
      case "form-string":
      case "json":
      case "data-urlencode":
        if (!httpMethodSpecified) {
          json.method = "POST";
        }

        if (argvs[argv].length > 1 && typeof argvs[argv] === "object") {
          // console.log(argvs[argv]);
          var i = 0;
          while (i < argvs[argv].length) {
            try {
              const str = parseData(argvs[argv][i]);
              if (typeof str !== "object") {
                throw new Error("Not a valid JSON");
              }
              if (!json.data) {
                json.data = {};
              }
              Object.assign(json.data, str);
              // json.data = str;

              // const obj = convertToObject(params);
              // Object.assign(json.data, obj);
              if (json.data.tags) {
                json.data.tags = str.tags;
              }

              // // Check if metadata exists and parse it into an object
              if (json.data.metadata) {
                json.data.metadata = str.metadata;
              }

              // // Check if options exists and parse it into an object
              if (json.data.options) {
                json.data.options = str.options;
              }
              // break;
            } catch (e) {
              const str = argvs[argv][i];
              if (!json.data) {
                json.data = {};
              }
              json.data[str] = "";
              if (json.data.tags) {
                json.data.tags = str.tags;
              }

              // // Check if metadata exists and parse it into an object
              if (json.data.metadata) {
                json.data.metadata = str.metadata;
              }

              // // Check if options exists and parse it into an object
              if (json.data.options) {
                json.data.options = str.options;
              }

              console.log(e);
            }
            i++;
          }
        } else {
          try {
            const str = parseData(argvs[argv]);
            if (typeof str !== "object") {
              throw new Error("Not a valid JSON");
            }
            if (!json.data) {
              json.data = {};
            }
            Object.assign(json.data, str);
            // json.data = str;

            // const obj = convertToObject(params);
            // Object.assign(json.data, obj);
            if (json.data.tags) {
              json.data.tags = str.tags;
            }

            // // Check if metadata exists and parse it into an object
            if (json.data.metadata) {
              json.data.metadata = str.metadata;
            }

            // // Check if options exists and parse it into an object
            if (json.data.options) {
              json.data.options = str.options;
            }
            // break;
          } catch (e) {
            const str = argvs[argv];
            if (!json.data) {
              json.data = {};
            }

            // Split the string into an array of key-value pairs
            const pairs = str.split("&");

            // Create an empty JSON object
            if (pairs.length > 1) {
              // Loop through each key-value pair and add it to the JSON object
              pairs.forEach((pair) => {
                // var [key, value] = ["", ""];
                var [key, value] = pair.split("=");
                if (value === undefined) {
                  value = "";
                }
                json.data[key] = value;
              });
            } else {
              if (str.includes("=")) {
                var [key, value] = str.split("=");
                if (value === undefined) {
                  value = "";
                }
                json.data[key] = value;
              } else {
                json.data[str] = "";
              }
            }
            if (json.data.tags) {
              json.data.tags = str.tags;
            }

            // // Check if metadata exists and parse it into an object
            if (json.data.metadata) {
              json.data.metadata = str.metadata;
            }

            // // Check if options exists and parse it into an object
            if (json.data.options) {
              json.data.options = str.options;
            }

            // console.log(e);
            break;
          }
        }
        break;

      case "compressed":
        if (!json.headers["Accept-Encoding"]) {
          json.headers["Accept-Encoding"] = argvs[argv] || "deflate, gzip";
        }
        json.compressed = true;
        break;
      case "X":
      case "request":
        httpMethodSpecified = true;
        json.method = argvs[argv];
        break;
      case "ntlm":
        json.auth_type = "ntlm";
        authTypeUsed = true;
        break;
      case "E":
        json.auth_type = "cert";
        json.auth = { cert: "", key: "" };
        json.auth.cert = argvs.E;
        json.auth.key = argvs.key;
        authTypeUsed = true;
        break;
      case "cert":
        json.auth_type = "cert";
        json.auth = { cert: "", key: "" };
        json.auth.cert = argvs.cert;
        json.auth.key = argvs.key;
        authTypeUsed = true;
        break;
      case "digest":
        json.auth_type = "digest";
        authTypeUsed = true;
        break;
      case "F":
      case "form":
        if (!json.files) {
          json.files = {};
        }
        if (Array.isArray(argvs[argv])) {
          argvs[argv].forEach((item) => {
            if (item.includes(".") || item.includes("file=")) {
              let [key, value] = item.split("=");
              value = value.replace(/[@<]/g, "");
              json.files[key] = value;
            } else {
              let [key, value] = item.split("=");
              if (!json.data) {
                json.data = {};
              }
              // value = value.replace(/[@<]/g, "");
              json.data[key] = value;
            }
          });
        } else {
          if (argvs[argv].includes(".") || argvs[argv].includes("file=")) {
            let [key, value] = argvs[argv].split("=");
            value = value.replace(/[@<]/g, "");
            json.files[key] = value;
          } else {
            let [key, value] = argvs[argv].split("=");
            if (!json.data) {
              json.data = {};
            }
            // value = value.replace(/[@<]/g, "");
            json.data[key] = value;
          }
        }
        // argvs[argv].forEach((item) => {
        // 	let [key, value] = item.split("=");
        // 	value = value.replace(/[@<]/g, "");
        // 	json.files[key] = value;
        // });
        break;
      case "connect-timeout":
        json.connect_timeout = argvs[argv];
        break;
      case "max-time":
        json.timeout = argvs[argv];
        break;
      case "o":
        json.output_file = argvs[argv];
        break;
      case "k":
      case "insecure":
        json.insecure = true;
        if (stringIsUrl(argvs[argv])) {
          json.raw_url = argvs[argv];
          const url = new URL(json.raw_url);
          const cleanUrl = url.origin + url.pathname;
          json.url = cleanUrl;

          // Check if the raw URL has any queries
          if (json.raw_url.includes("?")) {
            // Extract the query string from the URL
            const queryString = json.raw_url.split("?")[1];

            // Split the query string into individual query parameters
            const queryParams = queryString.split("&");

            json.queries = {};
            // Loop through each query parameter and add it to the queries object
            for (let i = 0; i < queryParams.length; i++) {
              const queryParam = queryParams[i].split("=");
              const paramName = queryParam[0];
              const paramValue = queryParam[1];
              json.queries[paramName] = paramValue;
            }
          }
        }
        break;
      case "r":
        try {
          argvs[argv].split(",").forEach((item) => {
            if (item.includes("-")) {
              let [start, end] = item.split("-");
              json.headers.Range = "bytes=" + start + "-" + end;
            } else {
              json.headers.Range = "bytes=" + item;
            }
          });
        } catch (e) {
          json.headers.Range = "bytes=" + argvs[argv];
        }
        break;
      case "O":
        if (stringIsUrl(argvs[argv])) {
          json.raw_url = argvs[argv];
          const url = new URL(json.raw_url);
          const cleanUrl = url.origin + url.pathname;
          json.url = cleanUrl;

          // Check if the raw URL has any queries
          if (json.raw_url.includes("?")) {
            // Extract the query string from the URL
            const queryString = json.raw_url.split("?")[1];

            // Split the query string into individual query parameters
            const queryParams = queryString.split("&");

            json.queries = {};
            // Loop through each query parameter and add it to the queries object
            for (let i = 0; i < queryParams.length; i++) {
              const queryParam = queryParams[i].split("=");
              const paramName = queryParam[0];
              const paramValue = queryParam[1];
              json.queries[paramName] = paramValue;
            }
          }
        }
        break;
      case "negotiate":
        json.auth_type = "negotiate";
        authTypeUsed = true;
        break;
      default:
        break;
    }
  }

  return json;
};

export default convertToJson;
