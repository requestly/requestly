import { omit } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";

const METADATA_FIELDS_TO_STRIP = ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"] as const;

export type ExportRecord = Omit<RQAPI.ApiClientRecord, typeof METADATA_FIELDS_TO_STRIP[number]>;

export type SanitizedEnvironment = EnvironmentData & { isGlobal: boolean };

export function sanitizeRecord(record: RQAPI.ApiClientRecord): ExportRecord {
  return omit(record, METADATA_FIELDS_TO_STRIP) as ExportRecord;
}

export function sanitizeRecords(collection: RQAPI.CollectionRecord): ExportRecord[] {
  const records: ExportRecord[] = [];

  records.push(sanitizeRecord({ ...collection, data: omit(collection.data, "children") }) as ExportRecord);

  if (collection.data.children) {
    collection.data.children.forEach((record: RQAPI.ApiClientRecord) => {
      if (record.type === RQAPI.RecordType.API) {
        records.push(sanitizeRecord(record));
      } else if (record.type === RQAPI.RecordType.COLLECTION) {
        records.push(...sanitizeRecords(record as RQAPI.CollectionRecord));
      }
    });
  }

  return records;
}

export function sanitizeEnvironments(environments: EnvironmentData[]): SanitizedEnvironment[] {
  return environments.map((env) => {
    const updatedVariables = Object.keys(env.variables).reduce((acc, key) => {
      const variable = env.variables[key];
      if (variable) {
        const { localValue, ...rest } = variable;
        acc[key] = rest;
      }
      return acc;
    }, {} as typeof env.variables);

    return { ...env, variables: updatedVariables, isGlobal: isGlobalEnvironment(env.id) };
  });
}
