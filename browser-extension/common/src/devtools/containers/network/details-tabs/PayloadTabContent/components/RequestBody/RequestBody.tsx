import React from "react";

import { RQNetworkEvent } from "../../../../../../types";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { isRequestBodyParseable } from "../../../../../../utils";

interface Props {
  networkEvent: RQNetworkEvent;
  parsed?: Boolean;
}

const RequestBodyParsed: React.FC<Props> = ({ networkEvent }) => {
  return (
    <ObjectInspector
      expandLevel={3}
      data={JSON.parse(networkEvent.request?.postData?.text)}
      includePrototypes={false}
      className="object-inspector"
    />
  );
};

const RequestBodySource: React.FC<Props> = ({ networkEvent }) => {
  return <div className="request-body-content">{networkEvent.request?.postData?.text}</div>;
};

const RequestBody: React.FC<Props> = ({ networkEvent, parsed }) => {
  if (parsed && isRequestBodyParseable(networkEvent.request.postData?.mimeType)) {
    return <RequestBodyParsed networkEvent={networkEvent} />;
  }

  return <RequestBodySource networkEvent={networkEvent} />;
};

export default RequestBody;
