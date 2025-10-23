import { RQAPI } from "features/apiClient/types";

export type SavedRunConfig = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];
  dataFile: RQAPI.RunConfig["dataFile"];
};

export type SavedRunConfigRecord = SavedRunConfig & {
  createdTs: number;
  updatedTs: number;
};
