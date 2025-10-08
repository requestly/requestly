import { IterationDetails, RunResult, RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import { RQAPI } from "features/apiClient/types";

export type SavedRunConfig = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
};

export type SavedRunConfigRecord = SavedRunConfig & {
  createdTs: number;
  updatedTs: number;
  collectionId: RQAPI.ApiClientRecord["collectionId"];
};

export type SavedRunResultRecord = RunResult & {
  id: string;
  iterations: IterationDetails[];
  runStatus: RunStatus.COMPLETED;
  collectionId: RQAPI.ApiClientRecord["collectionId"];
};
