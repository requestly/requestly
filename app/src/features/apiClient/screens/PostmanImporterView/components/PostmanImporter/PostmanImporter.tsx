import React, { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FilePicker } from "components/common/FilePicker";
import { getUploadedPostmanFileType, processPostmanCollectionData, processPostmanEnvironmentData } from "./utils";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system-v2/components";
import { EnvironmentVariableValue } from "backend/environment/types";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { RQAPI } from "features/apiClient/types";
import { upsertApiRecord } from "backend/apiClient";
import { useApiClientContext } from "features/apiClient/contexts";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { Row } from "antd";
import {
  trackImportFailed,
  trackImportParsed,
  trackImportParseFailed,
  trackImportSuccess,
} from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";
import "./postmanImporter.scss";
import { batchWrite } from "backend/utils";

type ProcessedData = {
  environments: { name: string; variables: Record<string, EnvironmentVariableValue>; isGlobal: boolean }[];
  apiRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
  variables: Record<string, EnvironmentVariableValue>;
};

interface PostmanImporterProps {
  onSuccess?: () => void;
}

type ProcessingStatus = "idle" | "processing" | "processed";

const BATCH_SIZE = 25;

export const PostmanImporter: React.FC<PostmanImporterProps> = ({ onSuccess }) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [processedFileData, setProcessedFileData] = useState<ProcessedData>({
    environments: [],
    apiRecords: [],
    variables: {},
  });

  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const { addNewEnvironment, setVariables, getEnvironmentVariables } = useEnvironmentManager({ initFetchers: false });
  const { onSaveRecord } = useApiClientContext();

  const collectionsCount = useRef(0);

  const handleFileDrop = useCallback(
    (files: File[]) => {
      setProcessingStatus("processing");
      setImportError(null);

      const processFiles = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onerror = () => reject(new Error("Could not process the selected file!"));

          reader.onload = () => {
            try {
              if (!file.type.includes("json")) {
                throw new Error("Invalid file. Please upload valid Postman export files.");
              }

              const fileContent = JSON.parse(reader.result as string);
              const postmanFileType = getUploadedPostmanFileType(fileContent);
              if (!postmanFileType) {
                throw new Error("Invalid file. Please upload valid Postman export files.");
              }

              if (postmanFileType === "environment") {
                const processedData = processPostmanEnvironmentData(fileContent);
                resolve({ type: postmanFileType, data: processedData });
              } else {
                const processedApiRecords = processPostmanCollectionData(fileContent);
                resolve({
                  type: postmanFileType,
                  data: {
                    type: postmanFileType,
                    apiRecords: processedApiRecords,
                  },
                });
              }
            } catch (error) {
              Logger.error("Error processing postman file:", error);
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
            throw new Error(
              "Could not process the selected files!, Please check if the files are valid Postman export files."
            );
          }

          const processedRecords: ProcessedData = {
            environments: [],
            apiRecords: [],
            variables: {},
          };

          results.forEach((result: any) => {
            if (result.status === "fulfilled") {
              if (result.value.type === "environment") {
                processedRecords.environments.push(result.value.data);
              } else {
                const { collections, apis } = result.value.data.apiRecords;
                processedRecords.variables = { ...processedRecords.variables, ...result.value.data.variables };
                processedRecords.apiRecords.push(...collections, ...apis);
                collectionsCount.current += collections.length;
                trackImportParsed("postman", collections.length, apis.length);
              }
            } else {
              trackImportParseFailed("postman", result.reason);
              console.error("Error processing postman file:", result.reason);
            }
          });

          setProcessedFileData(processedRecords);
          setProcessingStatus("processed");
        })
        .catch((error) => {
          trackImportParseFailed("postman", error.message);
          setImportError(error.message);
        })
        .finally(() => {
          if (importError) {
            setProcessingStatus("idle");
          }
        });
    },
    [importError]
  );

  const handleImportEnvironments = useCallback(async () => {
    try {
      const importPromises = processedFileData.environments.map(async (env) => {
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
      Logger.error("Postman data import failed:", error);
      throw error;
    }
  }, [addNewEnvironment, setVariables, processedFileData.environments, getEnvironmentVariables]);

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;
    let importedApisCount = 0;
    let failedApisCount = 0;

    const collections = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.COLLECTION);
    const apis = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.API);

    const handleCollectionWrites = async (collection: RQAPI.CollectionRecord) => {
      try {
        const newCollection = await upsertApiRecord(
          user?.details?.profile?.uid,
          collection,
          workspace?.id,
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

    const handleApiWrites = async (api: RQAPI.ApiRecord) => {
      const newCollectionId = collections.find((collection) => collection.id === api.collectionId)?.id;
      if (!newCollectionId) {
        throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
      }

      const updatedApi = { ...api, collectionId: newCollectionId };
      try {
        const newApi = await upsertApiRecord(user.details?.profile?.uid, updatedApi, workspace?.id, updatedApi.id);
        onSaveRecord(newApi.data, "none");
        importedApisCount++;
      } catch (error) {
        failedApisCount++;
        Logger.error("Error importing API:", error);
      }
    };

    await Promise.all([
      batchWrite(BATCH_SIZE, collections, handleCollectionWrites),
      batchWrite(BATCH_SIZE, apis, handleApiWrites),
    ]);

    if (failedCollectionsCount > 0 || failedApisCount > 0) {
      const failureMessage =
        failedCollectionsCount + failedApisCount > 0
          ? `${failedCollectionsCount + failedApisCount} ${
              failedCollectionsCount + failedApisCount > 1 ? "collections" : "collection"
            } failed`
          : "";
      if (failureMessage.length) {
        toast.warn(`Some imports failed: ${failureMessage}, Please contact support if the issue persists.`);
      }
    }

    return { importedCollectionsCount, importedApisCount };
  }, [processedFileData.apiRecords, user?.details?.profile?.uid, workspace?.id, onSaveRecord]);

  const handleImportPostmanData = useCallback(() => {
    setIsImporting(true);
    Promise.allSettled([handleImportEnvironments(), handleImportCollectionsAndApis()])
      .then((results) => {
        const [environmentsResult, collectionsResult] = results;
        const importedEnvironments = environmentsResult.status === "fulfilled" ? environmentsResult.value : 0;
        const importedCollections =
          collectionsResult.status === "fulfilled" ? collectionsResult.value.importedCollectionsCount : 0;
        const importedApis = collectionsResult.status === "fulfilled" ? collectionsResult.value.importedApisCount : 0;

        const failedEnvironments = processedFileData.environments.length - importedEnvironments;
        const failedCollections = collectionsCount.current - importedCollections;

        if (!importedEnvironments && !importedCollections && !importedApis) {
          toast.error("Failed to import Postman data");
          return;
        }

        const hasFailures = failedEnvironments > 0 || failedCollections > 0;
        const hasSuccesses = importedEnvironments > 0 || importedCollections + importedApis > 0;

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
            importedCollections + importedApis > 0
              ? `${importedCollections + importedApis} collection${importedCollections + importedApis !== 1 ? "s" : ""}`
              : "",
            importedEnvironments > 0
              ? `${importedEnvironments} environment${importedEnvironments !== 1 ? "s" : ""}`
              : "",
          ]
            .filter(Boolean)
            .join(" and ")}`
        );

        onSuccess?.();
        trackImportSuccess("postman", importedCollections, importedApis);
      })
      .catch((error) => {
        Logger.error("Postman data import failed:", error);
        setImportError("Something went wrong!, Couldn't import Postman data");
        trackImportFailed("postman", JSON.stringify(error));
      })
      .finally(() => {
        setIsImporting(false);
      });
  }, [handleImportEnvironments, handleImportCollectionsAndApis, onSuccess, processedFileData.environments.length]);

  const handleResetImport = () => {
    setProcessingStatus("idle");
    setIsImporting(false);
    setImportError(null);
    setProcessedFileData({
      environments: [],
      apiRecords: [],
      variables: {},
    });
    collectionsCount.current = 0;
  };

  return (
    <div className="postman-importer">
      <div className="postman-importer__header">
        <span>Import from Postman</span>
      </div>
      {importError ? (
        <div className="postman-importer__post-parse-view postman-importer__post-parse-view--error">
          <div className="postman-importer__post-parse-view--error-text">
            <IoMdCloseCircleOutline /> Invalid file. Please upload valid Postman export files.
          </div>
          <div className="postman-importer__post-parse-view--error-text-steps">
            {" "}
            <div className="mt-8">Follow below steps to export collections or environments from Postman:</div>
            <div>1. Click the 3 dots icon on the collections or environments you want to export</div>
            <div>2. In the dropdown menu, click on Export</div>
            <div>3. A Popup will open, choose any file format from v2 or v2.1</div>
            <div>4. Click on Export</div>
            <div>5. Import all the export files here at once</div>
          </div>
          <Row justify="end" className="w-full">
            <RQButton type="primary" onClick={handleResetImport} className="mt-8">
              Import other files
            </RQButton>
          </Row>
        </div>
      ) : processingStatus === "processed" ? (
        <div className="postman-importer__post-parse-view postman-importer__post-parse-view--success">
          <MdCheckCircleOutline />
          <div>
            Successfully processed{" "}
            {collectionsCount.current > 0 &&
              `${collectionsCount.current} collection${collectionsCount.current !== 1 ? "s" : ""}`}
            {collectionsCount.current > 0 && processedFileData.environments.length > 0 && " and "}
            {processedFileData.environments.length > 0 &&
              `${processedFileData.environments.length} environment${
                processedFileData.environments.length !== 1 ? "s" : ""
              }`}
          </div>
          <RQButton type="primary" loading={isImporting} onClick={handleImportPostmanData}>
            Import
          </RQButton>
        </div>
      ) : (
        <FilePicker
          maxFiles={1000}
          onFilesDrop={handleFileDrop}
          isProcessing={processingStatus === "processing"}
          title="Drop your Postman collections or environments export files here"
          subtitle="Accepted file formats: Postman v2 or v2.1 JSON file"
          selectorButtonTitle="Select file"
        />
      )}
    </div>
  );
};
