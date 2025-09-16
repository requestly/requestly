import { RQAPI } from "features/apiClient/types";

export type SaveRunConfig = Pick<RQAPI.RunConfig, "runOrder">;

export type FetchedRunConfig = Pick<RQAPI.RunConfig, "id" | "runOrder">;
