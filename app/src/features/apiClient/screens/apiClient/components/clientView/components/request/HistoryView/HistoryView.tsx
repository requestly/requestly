import React from "react";
import { APIClient } from "features/apiClient/screens/apiClient/APIClient";

export const HistoryView: React.FC = () => {
  return <APIClient isCreateMode={false} />;
};
