import { RQAPI } from "features/apiClient/types";

export interface PreRequestScriptWorkload {
  request: RQAPI.Entry["request"];
  script: RQAPI.Entry["scripts"]["preRequest"];
}

export interface PostResponseScriptWorkload {
  request: RQAPI.Entry["request"];
  response: RQAPI.Entry["response"];
  script: RQAPI.Entry["scripts"]["postResponse"];
}
