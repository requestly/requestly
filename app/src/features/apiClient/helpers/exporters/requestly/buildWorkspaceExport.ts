import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";
import { ExportRecord, SanitizedEnvironment, sanitizeRecord, sanitizeRecords, sanitizeEnvironments } from "./sanitize";

export const WORKSPACE_EXPORT_SCHEMA_VERSION = "1.0.0";

export interface CollectionsExportJson {
  schema_version: string;
  records: ExportRecord[];
}

export interface EnvironmentsExportJson {
  schema_version: string;
  environments: SanitizedEnvironment[];
}

export interface WorkspaceExportCounts {
  collections: number;
  apis: number;
  environments: number;
}

export interface WorkspaceExportPayload {
  collectionsJson: CollectionsExportJson;
  environmentsJson: EnvironmentsExportJson;
  counts: WorkspaceExportCounts;
}

export interface BuildWorkspaceExportInput {
  /**
   * Top-level records pulled from the hydrated API Client store (typically via
   * `useRootRecords()`). Collections must already have `data.children`
   * populated and API records must have their examples inlined under
   * `data.examples` — both conditions are met after the standard tree
   * hydration step.
   */
  rootRecords: RQAPI.ApiClientRecord[];
  /** All environments (including global). */
  environments: EnvironmentData[];
}

export function buildWorkspaceExport(input: BuildWorkspaceExportInput): WorkspaceExportPayload {
  const { rootRecords, environments } = input;

  const records: ExportRecord[] = [];
  let collectionCount = 0;
  let apiCount = 0;

  rootRecords.forEach((record) => {
    if (record.type === RQAPI.RecordType.COLLECTION) {
      records.push(...sanitizeRecords(record as RQAPI.CollectionRecord));
    } else if (record.type === RQAPI.RecordType.API) {
      records.push({ ...sanitizeRecord(record), collectionId: "" } as ExportRecord);
    }
  });

  records.forEach((r) => {
    if ((r as any).type === RQAPI.RecordType.COLLECTION) collectionCount += 1;
    if ((r as any).type === RQAPI.RecordType.API) apiCount += 1;
  });

  const sanitizedEnvs = sanitizeEnvironments(environments);

  return {
    collectionsJson: { schema_version: WORKSPACE_EXPORT_SCHEMA_VERSION, records },
    environmentsJson: { schema_version: WORKSPACE_EXPORT_SCHEMA_VERSION, environments: sanitizedEnvs },
    counts: { collections: collectionCount, apis: apiCount, environments: sanitizedEnvs.length },
  };
}
