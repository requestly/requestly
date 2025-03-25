import React from "react";
import { APIClient } from "../../../APIClient";

export const RequestView: React.FC<{ requestId: string }> = (props) => {
  return <APIClient isCreateMode={false} {...props} />;
};
