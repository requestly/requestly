import { RQAPI } from "features/apiClient/types";

export const getPreRequestScriptWorkload = (entry: RQAPI.Entry) => {
  if (entry.scripts?.preRequest) {
    console.log("!!!debug", "pre", entry);
    return {
      request: entry.request,
      script: entry.scripts.preRequest,
    };
  }
  return null;
};

export const getPostResponseScriptWorkload = (entry: RQAPI.Entry) => {
  console.log("!!!debug", "post script", entry);
  if (entry.scripts?.postResponse) {
    return {
      request: entry.request,
      response: entry.response,
      script: entry.scripts.postResponse,
    };
  }
  return null;
};
