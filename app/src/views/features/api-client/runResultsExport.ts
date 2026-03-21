const DB_NAME = "apiClientLocalStorageDB";
const STORE_NAME = "apis";

export interface ExportResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

function getLastRunResults(apis: unknown[]): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  for (const item of apis) {
    const record = item as { name?: string; runResults?: unknown[] };
    if (!record?.runResults?.length) continue;

    const lastResult = record.runResults[record.runResults.length - 1];
    if (lastResult) {
      results.push({
        collectionName: record.name,
        runResults: lastResult,
      });
    }
  }

  return results;
}

export function exportCollectionRunResults(): Promise<ExportResult> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve({ success: false, error: "IndexedDB not available" });
      return;
    }

    const request = indexedDB.open(DB_NAME);

    request.onerror = () => {
      resolve({ success: false, error: "Failed to open database" });
    };

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve({ success: false, error: "No collection data found" });
        return;
      }

      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => {
        db.close();
        resolve({ success: false, error: "Failed to read data" });
      };

      getAllRequest.onsuccess = () => {
        const apis = getAllRequest.result ?? [];
        const exportData = getLastRunResults(apis);
        db.close();

        if (exportData.length === 0) {
          resolve({ success: false, error: "No run results found" });
          return;
        }

        resolve({ success: true, data: exportData });
      };
    };
  });
}

export function downloadRunResults(data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `collection-run-results-${timestamp}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
