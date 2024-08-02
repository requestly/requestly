import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import { ChromeWebRequestLog } from "modules/extension/types";

export const convertWebRequestLogToRQNetworkLog = (
  requestDetails: ChromeWebRequestLog & {
    rqRequestBody: any;
  }
): RQNetworkLog => {
  let queryString = [] as RQNetworkLog["entry"]["request"]["queryString"];

  try {
    const { searchParams } = new URL(requestDetails.url);
    searchParams.forEach((value: string, key: string) => queryString.push({ name: key, value }));
  } catch (error) {
    //Do nothing
  }

  return {
    id: requestDetails.requestId,
    entry: {
      startedDateTime: new Date(requestDetails.timeStamp).toLocaleTimeString(),
      request: {
        url: requestDetails.url,
        method: requestDetails.method,
        headers: requestDetails.requestHeaders ?? [],
        postData: {
          text: JSON.stringify(requestDetails.rqRequestBody),
          mimeType: "",
        },
        queryString,
      },
      response: {
        headers: requestDetails.responseHeaders ?? [],
        status: requestDetails.statusCode,
        content: {
          text: requestDetails.responseBody || "",
          mimeType: "",
        },
        type: requestDetails.type,
      },
    },
  };
};
