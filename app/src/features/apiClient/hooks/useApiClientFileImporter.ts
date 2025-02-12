import { useState, useCallback } from "react";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import { batchWrite } from "backend/utils";
import { upsertApiRecord } from "backend/apiClient";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { useSelector } from "react-redux";
import { useApiClientContext } from "features/apiClient/contexts";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQAPI } from "features/apiClient/types";
import {
  trackImportApiCollectionsFailed,
  trackImportApiCollectionsStarted,
  trackImportApiCollectionsSuccessful,
} from "modules/analytics/events/features/apiClient";
import { processRqImportData } from "features/apiClient/screens/apiClient/components/modals/importModal/utils";
import { EnvironmentVariableValue } from "backend/environment/types";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";
import { getActiveWorkspaceId } from "features/workspaces/utils";

const BATCH_SIZE = 25;

type ProcessedData = {
  environments: { name: string; variables: Record<string, EnvironmentVariableValue>; isGlobal: boolean }[];
  collections: RQAPI.CollectionRecord[];
  apis: RQAPI.ApiRecord[];
  recordsCount: number;
};

type ProcessingStatus = "idle" | "processing" | "processed";

export enum ImporterTypes {
  RQ = "RQ",
}

const useApiClientFileImporter = (importer: ImporterTypes) => {
  const processors: Record<string, (content: any, uid: string) => any> = {
    RQ: processRqImportData,
    // Add other importers as needed
  };

  const [processedFileData, setProcessedFileData] = useState<ProcessedData>({
    apis: [],
    environments: [],
    collections: [],
    recordsCount: 0,
  });

  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");

  const { addNewEnvironment, setVariables, getEnvironmentVariables } = useEnvironmentManager({ initFetchers: false });
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);
  const activeWorkspaceId = getActiveWorkspaceId(activeWorkspaceIds);
  const { onSaveRecord } = useApiClientContext();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  const { environments = [], collections = [], apis = [], recordsCount = 0 } = processedFileData;

  const processFiles = useCallback(
    (files: File[]) => {
      setProcessingStatus("processing");
      setError(null);

      const processFiles = files.map((file) => {
        return new Promise((resolve, reject) => {
          if (!file.type.includes("json")) {
            throw new Error("Invalid file format. Please select a valid JSON export file.");
          }
          const reader = new FileReader();

          reader.onerror = () => setError("Failed to import the selected file.");
          reader.onabort = () => setError("Processing aborted");

          reader.onload = () => {
            try {
              const content = JSON.parse(reader.result as string);
              const processor = processors[importer];

              if (!processor) {
                throw new Error(`Unsupported importer: ${importer}`);
              }

              const processedData = processor(content, uid);
              resolve(processedData);
            } catch (error) {
              Logger.error("Error processing file:", error);
              reject(error);
            }
          };
          reader.readAsText(file);
        });
      });

      Promise.allSettled(processFiles)
        .then((results) => {
          const hasProcessingAllFilesFailed = !results.some((result) => result.status === "fulfilled");
          if (hasProcessingAllFilesFailed) {
            throw new Error("Could not process the selected files!, Please check if the files are valid export files.");
          }

          results.forEach((result: any) => {
            if (result.status === "fulfilled") {
              setProcessedFileData((prev) => {
                prev.collections.push(...result.value.collections);
                prev.apis.push(...result.value.apis);
                prev.environments.push(...result.value.environments);
                prev.recordsCount = prev.recordsCount + result.value.count;
                return prev;
              });
            } else {
              console.error("Error processing file:", result.reason);
            }
          });

          setProcessingStatus("processed");
        })
        .catch((error) => {
          setError(error.message);
          setProcessingStatus("idle");
        });
    },
    [error, processors, importer, uid]
  );

  const handleImportEnvironments = useCallback(async (): Promise<number> => {
    try {
      const importPromises = environments.map(async (env) => {
        if (env.isGlobal) {
          const globalEnvVariables = getEnvironmentVariables("global");
          await setVariables("global", { ...globalEnvVariables, ...env.variables });
          return true;
        } else {
          const newEnvironment = await addNewEnvironment(env.name);
          if (newEnvironment) {
            await setVariables(newEnvironment.id, env.variables);
            return true;
          }
        }
        return false;
      });

      const results = await Promise.allSettled(importPromises);
      return results.filter((result) => result.status === "fulfilled").length;
    } catch (error) {
      Logger.error("Data import failed:", error);
      throw error;
    }
  }, [environments, getEnvironmentVariables, addNewEnvironment, setVariables]);

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;

    // Utility function to handle batch writes for collections
    const handleCollectionWrites = async (collection: RQAPI.CollectionRecord) => {
      try {
        const newCollection = await upsertApiRecord(
          user?.details?.profile?.uid,
          collection,
          activeWorkspaceId,
          collection.id
        );
        onSaveRecord(newCollection.data, "none");
        importedCollectionsCount++;
        return newCollection.data.id;
      } catch (error) {
        failedCollectionsCount++;
        Logger.error("Error importing collection:", error);
        return null;
      }
    };

    // Utility function to handle batch writes for collections
    const handleApiWrites = async (api: RQAPI.ApiRecord) => {
      const newCollectionId = collections.find((collection) => collection.id === api.collectionId)?.id;
      if (!newCollectionId) {
        throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
      }

      const updatedApi = { ...api, collectionId: newCollectionId };
      try {
        const newApi = await upsertApiRecord(user.details?.profile?.uid, updatedApi, activeWorkspaceId, updatedApi.id);
        onSaveRecord(newApi.data, "none");
      } catch (error) {
        failedCollectionsCount++;
        Logger.error("Error importing API:", error);
      }
    };

    await Promise.all([
      batchWrite(BATCH_SIZE, collections, handleCollectionWrites),
      batchWrite(BATCH_SIZE, apis, handleApiWrites),
    ]);

    if (failedCollectionsCount > 0) {
      const failureMessage =
        failedCollectionsCount > 0
          ? `${failedCollectionsCount} ${failedCollectionsCount > 1 ? "collections" : "collection"} failed`
          : "";
      if (failureMessage.length) {
        toast.warn(`Some imports failed: ${failureMessage}, Please contact support if the issue persists.`);
      }
    }

    return importedCollectionsCount;
  }, [user, activeWorkspaceId, onSaveRecord, collections, apis]);

  const handleImportData = useCallback(
    async (onSuccess: () => void) => {
      setIsImporting(true);
      trackImportApiCollectionsStarted(recordsCount, environments.length);

      try {
        const [envResult, collResult] = await Promise.allSettled([
          handleImportEnvironments(),
          handleImportCollectionsAndApis(),
        ]);

        const importedEnvironments = envResult.status === "fulfilled" ? envResult.value : 0;
        const importedCollections = collResult.status === "fulfilled" ? collResult.value : 0;

        const failedEnvironments = environments.length - importedEnvironments;
        const failedCollections = collections.length - importedCollections;

        if (!importedEnvironments && !importedCollections) {
          toast.error("Failed to import data");
          return;
        }

        const hasFailures = failedEnvironments > 0 || failedCollections > 0;
        const hasSuccesses = importedEnvironments > 0 || importedCollections > 0;

        if (hasFailures && hasSuccesses) {
          const failureMessage = [
            failedCollections > 0 ? `${failedCollections} collection${failedCollections !== 1 ? "s" : ""}` : "",
            failedEnvironments > 0 ? `${failedEnvironments} environment${failedEnvironments !== 1 ? "s" : ""}` : "",
          ]
            .filter(Boolean)
            .join(" and ");

          toast.warn(`Partial import success. Failed to import: ${failureMessage}`);
          return;
        }

        toast.success(
          `Successfully imported ${[
            importedCollections > 0 ? `${importedCollections} collection${importedCollections !== 1 ? "s" : ""}` : "",
            importedEnvironments > 0
              ? `${importedEnvironments} environment${importedEnvironments !== 1 ? "s" : ""}`
              : "",
          ]
            .filter(Boolean)
            .join(" and ")}`
        );
        trackImportApiCollectionsSuccessful(recordsCount, environments.length);
        onSuccess();
      } catch (error) {
        Logger.error("Data import failed:", error);
        setError("Something went wrong! Couldn't import data");
        trackImportApiCollectionsFailed(recordsCount, environments.length);
      } finally {
        setIsImporting(false);
      }
    },
    [collections, apis, environments, recordsCount]
  );

  const resetImportData = () => {
    setError(null);
    setIsImporting(false);
    setProcessingStatus("idle");
    setProcessedFileData({ apis: [], environments: [], collections: [], recordsCount: 0 });
  };

  return { isImporting, error, processFiles, handleImportData, resetImportData, processingStatus };
};

export default useApiClientFileImporter;
