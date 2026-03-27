import React from "react";
import { ApiClientViewManager } from "../../../../clientView/ApiClientViewManager";

export const RequestView: React.FC<{ requestId: string }> = (props) => {
  return <ApiClientViewManager {...props} />;
};
