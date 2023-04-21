import { getAPIResponse } from "actions/ExtensionActions";
import { RQAPI } from "./types";

export const makeRequest = async (request: RQAPI.Request): Promise<RQAPI.Response> => {
  // TODO: check if Extension or Desktop App is installed and has the support
  // TODO: add support in MV3 extension
  return getAPIResponse(request);
};
