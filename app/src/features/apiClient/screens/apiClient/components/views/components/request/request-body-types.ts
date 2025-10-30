import { RQAPI, RequestContentType } from "../../../../../../types";

//How are we deciding this which is single & multiple
//Now all values will go in bodyContainer hence, mention body gets removed from here
export type RequestBodyProps = {
  contentType: RequestContentType;
  recordId: string;
  setRequestEntry: (updaterFn: (prev: RQAPI.HttpApiEntry) => RQAPI.HttpApiEntry) => void;
  setContentType: (contentType: RequestContentType) => void;
} & /**
 * We maintain two modes now, single and multiple. In single mode the body can hold
 * just one kind of data. In multiple, it holds all kinds simultaenously.
 */ (
  | {
      mode: "single";
      bodyContainer: RQAPI.RequestBodyContainer;
    }
  | {
      mode: "multiple";
      bodyContainer: RQAPI.RequestBodyContainer;
    }
);
