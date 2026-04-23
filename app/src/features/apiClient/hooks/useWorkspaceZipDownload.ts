import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/types";
import { getWorkspaceById, dummyPersonalWorkspace } from "store/slices/workspaces/selectors";
import { useAllRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useAllEnvironments, useGlobalEnvironment } from "features/apiClient/slices/environments/environments.hooks";
import { useApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { convertFlatRecordsToNestedRecords } from "features/apiClient/screens/apiClient/utils";
import { parseEnvironmentEntityToData } from "features/apiClient/slices/environments/utils";
import {
  buildWorkspaceExport,
  WorkspaceExportPayload,
} from "features/apiClient/helpers/exporters/requestly/buildWorkspaceExport";
import { zipWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/zipWorkspaceExport";
import { getFormattedDate } from "utils/DateTimeUtils";

function slugifyWorkspaceName(name: string): string {
  const slug = name
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "workspace";
}

export function buildExportFileName(
  workspaceName: string,
  dateFactory: () => string = () => getFormattedDate("DD_MM_YYYY")
): string {
  return `RQ-workspace-${slugifyWorkspaceName(workspaceName)}-export-${dateFactory()}.zip`;
}

interface AssembleInputs {
  rootRecords: ReturnType<typeof convertFlatRecordsToNestedRecords>["updatedRecords"];
  environments: ReturnType<typeof parseEnvironmentEntityToData>[];
}

interface AssembleResult {
  bytes: Uint8Array;
  counts: WorkspaceExportPayload["counts"];
}

export function assembleWorkspaceZip({ rootRecords, environments }: AssembleInputs): AssembleResult {
  const payload = buildWorkspaceExport({ rootRecords, environments });
  const bytes = zipWorkspaceExport(payload);
  return { bytes, counts: payload.counts };
}

export function triggerBrowserZipDownload(bytes: Uint8Array, fileName: string): void {
  // Copy so the Blob contains exactly the view's bytes (bytes.buffer alone would include
  // unrelated data if `bytes` were a subarray view).
  const payload = new Uint8Array(bytes);
  const blob = new Blob([payload.buffer as ArrayBuffer], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface UseWorkspaceZipDownloadReturn {
  download: () => Promise<{ zipSizeBytes: number; durationMs: number; counts: AssembleResult["counts"] }>;
  isReady: boolean;
  isDownloading: boolean;
  error: Error | null;
  workspaceType: string;
  counts: AssembleResult["counts"];
}

export function useWorkspaceZipDownload(): UseWorkspaceZipDownloadReturn {
  const allRecords = useAllRecords();
  const globalEnvironment = useGlobalEnvironment();
  const allEnvironments = useAllEnvironments();
  const ctx = useApiClientFeatureContext();

  const workspace = useSelector((state: RootState) =>
    ctx.workspaceId === null ? dummyPersonalWorkspace : getWorkspaceById(ctx.workspaceId)(state)
  );
  const workspaceName = workspace?.name ?? "Workspace";
  const workspaceType = workspace?.workspaceType ?? "UNKNOWN";

  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { rootRecords, environments } = useMemo(() => {
    const { updatedRecords } = convertFlatRecordsToNestedRecords(allRecords);
    const envs = [
      parseEnvironmentEntityToData(globalEnvironment),
      ...allEnvironments.map(parseEnvironmentEntityToData),
    ];
    return { rootRecords: updatedRecords, environments: envs };
  }, [allRecords, globalEnvironment, allEnvironments]);

  const counts = useMemo(() => buildWorkspaceExport({ rootRecords, environments }).counts, [rootRecords, environments]);

  const isEmpty = counts.collections === 0 && counts.apis === 0 && counts.environments === 0;
  const isReady = !isEmpty && !isDownloading;

  const download = useCallback(async () => {
    setError(null);
    setIsDownloading(true);
    const startedAt = Date.now();

    // Yield once so React can paint the "loading" state before the zip build blocks the main thread.
    await Promise.resolve();

    try {
      const result = assembleWorkspaceZip({ rootRecords, environments });
      const fileName = buildExportFileName(workspaceName);
      triggerBrowserZipDownload(result.bytes, fileName);
      const durationMs = Date.now() - startedAt;
      return { zipSizeBytes: result.bytes.byteLength, durationMs, counts: result.counts };
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Unknown error");
      setError(err);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, [rootRecords, environments, workspaceName]);

  return { download, isReady, isDownloading, error, workspaceType, counts };
}
