import { RQAPI } from "features/apiClient/types";
import { DocumentData } from "firebase/firestore";
import { runAuthMigration } from "./auth";

// a place to write migrations against any schema/type changes
export function enforceLatestRecordSchema(id: DocumentData["id"], rawData: DocumentData): RQAPI.Record {
  let record = rawData as Partial<RQAPI.Record>;
  record.id = id;
  const auth = runAuthMigration(record);
  record.data.auth = auth;
  return record as RQAPI.Record;
}
