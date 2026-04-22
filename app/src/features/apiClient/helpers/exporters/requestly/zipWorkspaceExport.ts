import { strToU8, zipSync } from "fflate";
import { WorkspaceExportPayload } from "./buildWorkspaceExport";

export const WORKSPACE_ZIP_FILENAMES = {
  collections: "collections.json",
  environments: "environments.json",
} as const;

/**
 * Packages a `WorkspaceExportPayload` into a zip and returns the raw bytes.
 * Callers are responsible for wrapping the result in a `Blob` and triggering
 * the browser download.
 */
export function zipWorkspaceExport(payload: WorkspaceExportPayload): Uint8Array {
  const files: Record<string, Uint8Array> = {
    [WORKSPACE_ZIP_FILENAMES.collections]: strToU8(JSON.stringify(payload.collectionsJson, null, 2)),
    [WORKSPACE_ZIP_FILENAMES.environments]: strToU8(JSON.stringify(payload.environmentsJson, null, 2)),
  };

  return zipSync(files);
}
