import { RQAPI } from "features/apiClient/types";

export type SavedRunConfig = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
};
