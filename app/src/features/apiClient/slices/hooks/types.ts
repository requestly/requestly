import type { ApiRecordsState } from "../apiRecords/types";
import type { BufferState } from "../buffer/types";
import type { EnvironmentsState } from "../environments/types";
import {
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  BUFFER_SLICE_NAME,
} from "../common/constants";

export interface ApiClientRootState {
  [API_CLIENT_RECORDS_SLICE_NAME]: ApiRecordsState;
  [API_CLIENT_ENVIRONMENTS_SLICE_NAME]: EnvironmentsState;
  [BUFFER_SLICE_NAME]: BufferState;
}
