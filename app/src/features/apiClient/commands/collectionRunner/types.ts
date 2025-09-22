import { RQAPI } from "features/apiClient/types";

export type SavedRunConfig = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
};

export type SavedRunConfigRecord = SavedRunConfig & {
  createdTs: number;
  updatedTs: number;
};
