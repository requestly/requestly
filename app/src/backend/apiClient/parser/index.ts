import { RQAPI } from "features/apiClient/types";
import { DocumentData } from "firebase/firestore";
import { patchAuthSchema } from "./auth";

// a place to write migrations against any schema/type changes
export function enforceLatestRecordSchema(id: DocumentData["id"], rawData: DocumentData): RQAPI.ApiClientRecord {
  let record = rawData as Partial<RQAPI.ApiClientRecord>;
  record.id = id;
  const auth = patchAuthSchema(record);
  if (!record.data) {
    record.data = {} as RQAPI.ApiClientRecord["data"];
  }
  record.data.auth = auth;
  return record as RQAPI.ApiClientRecord;
}
