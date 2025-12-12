import { EntityState } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { TreeIndices } from "../types";

export interface ApiRecordsState {
  records: EntityState<RQAPI.ApiClientRecord>;
  tree: TreeIndices;
}
