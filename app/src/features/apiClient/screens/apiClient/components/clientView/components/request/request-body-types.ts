import { EnvironmentVariables } from "backend/environment/types";
import { RQAPI, RequestContentType } from "../../../../../../types";
import { AnalyticEventProperties } from "componentsV2/CodeEditor/types";

export type RequestBodyProps = {
  contentType: RequestContentType;
  variables: EnvironmentVariables;
  setRequestEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
  setContentType: (contentType: RequestContentType) => void;
  analyticEventProperties?: AnalyticEventProperties;
} & /**
 * We maintain two modes now, single and multiple. In single mode the body can hold
 * just one kind of data. In multiple, it holds all kinds simultaenously.
 */ (
  | {
      mode: "single";
      body: RQAPI.RequestBody;
    }
  | {
      mode: "multiple";
      bodyContainer: RQAPI.RequestBodyContainer;
    }
);
