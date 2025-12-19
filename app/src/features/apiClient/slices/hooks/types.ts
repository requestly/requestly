import { ApiRecordsState } from "../apiRecords/types";
import { BufferState } from "../buffer/types";

export interface ApiClientRootState {
  apiRecords: ApiRecordsState;
  buffer: BufferState;
}
