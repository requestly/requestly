import React from "react";
import { APIClient } from "../../../APIClient";

export const DraftRequestView: React.FC<{
  onSaveCallback: (requestId: string) => void;
}> = (props) => {
  return <APIClient isCreateMode={true} {...props} />;
};
