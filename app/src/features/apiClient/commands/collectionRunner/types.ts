import { RQAPI } from "features/apiClient/types";

export type SavedRunConfig = Pick<RQAPI.RunConfig, "id" | "runOrder">;
