import { ApiRecordsState } from "../../slices/apiRecords/types";
import { BuffersState } from "../../slices/buffers/types";

export interface ApiClientRootState {
  apiRecords: ApiRecordsState;
  buffers: BuffersState;
}
