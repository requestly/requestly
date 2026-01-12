import type { EnvironmentData } from "backend/environment/types";
import type { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";

export type ExampleCollectionsImportStatus =
  | { type: "NOT_IMPORTED" }
  | { type: "IMPORTING" }
  | { type: "IMPORTED"; importedAt: number }
  | { type: "FAILED"; error: string; failedAt: number };

export interface ExampleCollectionsState {
  readonly isNudgePermanentlyClosed: boolean;
  readonly importStatus: ExampleCollectionsImportStatus;
}

export type ImportResult =
  | { success: true; recordCount: number }
  | { success: false; error: string; reason: ImportFailureReason };

export type ImportFailureReason =
  | "ALREADY_IMPORTING"
  | "ALREADY_IMPORTED"
  | "NUDGE_CLOSED"
  | "REPOSITORY_ERROR"
  | "ENVIRONMENT_ERROR"
  | "UNKNOWN_ERROR";

export interface ImportDependencies {
  readonly repository: ApiClientRepositoryInterface;
  readonly ownerId: string | null;
  readonly environmentsToCreate: EnvironmentData[];
  readonly apiClientDispatch: (action: any) => void;
}
