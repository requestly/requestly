import { ApiRecordsState } from "../apiRecords/types";
import { BufferState } from "../buffer/types";
import { API_CLIENT_RECORDS_SLICE_NAME } from "../common/constants";

export interface ApiClientRootState {
  [API_CLIENT_RECORDS_SLICE_NAME]: ApiRecordsState;
  buffer: BufferState;
}
