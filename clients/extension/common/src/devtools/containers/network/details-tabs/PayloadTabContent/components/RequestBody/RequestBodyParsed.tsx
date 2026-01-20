import React from "react";

import { RQNetworkEvent } from "../../../../../../types";
import { ObjectInspector } from "@devtools-ds/object-inspector";

interface Props {
  networkEvent: RQNetworkEvent;
  parsed?: Boolean;
}

// Displaying on JSON parsed body for now
// Future Improvements: Form-Data (application/x-www-form-urlencoded)
const RequestBodyParsed: React.FC<Props> = ({ networkEvent }) => {
  let parsedBody = networkEvent.request?.postData?.text;

  try {
    parsedBody = JSON.parse(networkEvent.request?.postData?.text);
  } catch (err) {
    console.log("Unable to parse Request Body");
  }

  return <ObjectInspector expandLevel={3} data={parsedBody} includePrototypes={false} className="object-inspector" />;
};

export default RequestBodyParsed;
