import { RQAPI, RequestContentType } from "../../../../../../types";

//How are we deciding this which is single & multiple
//Now all values will go in bodyContainer hence, mention body gets removed from here
export type RequestBodyProps = {
  contentType: RequestContentType;
  recordId: string;
  setRequestEntry: (updaterFn: (prev: RQAPI.HttpApiEntry) => RQAPI.HttpApiEntry) => void;
  setContentType: (contentType: RequestContentType) => void;
  bodyContainer: RQAPI.RequestBodyContainer;
};
