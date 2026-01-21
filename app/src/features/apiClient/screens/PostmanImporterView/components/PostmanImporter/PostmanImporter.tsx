import React, { useCallback, useRef, useState } from "react";
import { FilePicker } from "components/common/FilePicker";
import { getUploadedPostmanFileType, processPostmanCollectionData, processPostmanEnvironmentData } from "./utils";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system-v2/components";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { ApiClientImporterType, RQAPI } from "features/apiClient/types";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { notification, Row } from "antd";
import {
  trackImportFailed,
  trackImportParsed,
  trackImportParseFailed,
  trackImportSuccess,
} from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";
import "./postmanImporter.scss";
import * as Sentry from "@sentry/react";
import { useCommand } from "features/apiClient/commands";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { EnvironmentVariableData } from "features/apiClient/store/variables/types";
import { wrapWithCustomSpan } from "utils/sentry";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";

type ProcessedData = {
  environments: { name: string; variables: Record<string, EnvironmentVariableData>; isGlobal: boolean }[];
  apiRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
  variables: Record<string, EnvironmentVariableData>;
};

interface PostmanImporterProps {
  onSuccess?: () => void;
}

type ProcessingStatus = "idle" | "processing" | "processed";

const BATCH_SIZE = 25;

export const PostmanImporter: React.FC<PostmanImporterProps> = ({ onSuccess }) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [processedFileData, setProcessedFileData] = useState<ProcessedData>({
    environments: [],
    apiRecords: [],
    variables: {},
  });

  const {
    env: { createEnvironment, patchEnvironmentVariables },
  } = useCommand();
  const { apiClientRecordsRepository, environmentVariablesRepository } = useApiClientRepository();
  const { onSaveRecord } = useNewApiClientContext();

  const collectionsCount = useRef(0);

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      return wrapWithCustomSpan(
        {
          name: "[Transaction] api_client.postman_import.process_files",
          op: "api_client.postman_import.process_files",
          forceTransaction: true,
          attributes: {},
        },
        async (files: File[]) => {
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
                    const processedApiRecords = processPostmanCollectionData(fileContent, apiClientRecordsRepository);
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
                  Sentry.withScope((scope) => {
                    scope.setTag("error_type", "api_client_postman_processing");
                    Sentry.captureException(error);
                  });
                }
              };
              reader.readAsText(file);
            });
          });

          await Promise.allSettled(processFiles)
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
                    trackImportParsed(ApiClientImporterType.POSTMAN, collections.length, apis.length);
                  }
                } else {
                  trackImportParseFailed(ApiClientImporterType.POSTMAN, result.reason);
                }
              });

              setProcessedFileData(processedRecords);
              setProcessingStatus("processed");
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_OK,
              });
            })
            .catch((error) => {
              trackImportParseFailed(ApiClientImporterType.POSTMAN, error.message);
              setImportError(error.message);
              Sentry.withScope((scope) => {
                scope.setTag("error_type", "api_client_postman_import");
                Sentry.captureException(error);
              });
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_ERROR,
              });
            })
            .finally(() => {
              if (importError) {
                setProcessingStatus("idle");
              }
            });
        }
      )(files);
    },
    [importError, apiClientRecordsRepository]
  );

  const handleImportEnvironments = useCallback(async () => {
    try {
      const importPromises = processedFileData.environments.map(async (env) => {
        if (env.isGlobal) {
          await patchEnvironmentVariables({
            environmentId: environmentVariablesRepository.getGlobalEnvironmentId(),
            variables: env.variables,
          });
          return true;
        } else {
          await createEnvironment({
            newEnvironmentName: env.name,
            variables: env.variables,
          });
        }
        return false;
      });

      const results = await Promise.allSettled(importPromises);
      results.forEach((result) => {
        if (result.status === "rejected") {
          const err = result.reason;
          Sentry.captureException(err);
        }
      });
      return results.filter((result) => result.status === "fulfilled").length;
    } catch (error) {
      Logger.error("Postman data import failed:", error);
      throw error;
    }
  }, [processedFileData.environments, patchEnvironmentVariables, environmentVariablesRepository, createEnvironment]);

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;
    let importedApisCount = 0;

    const collections = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.COLLECTION);
    const apis = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.API);

    const handleCollectionWrites = async (collection: RQAPI.CollectionRecord) => {
      try {
        const newCollection = await apiClientRecordsRepository.createCollectionFromImport(collection, collection.id);
        // for the cases newCollection .success is false
        // inside createRecordWithId we are already capturing the exception in sentry
        if (newCollection.success) {
          onSaveRecord(newCollection.data);
          importedCollectionsCount++;
          return newCollection.data.id;
        } else {
          failedCollectionsCount++;
          return null;
        }
      } catch (error) {
        failedCollectionsCount++;
        Logger.error("Error importing collection:", error);
        return null;
      }
    };

    const collectionWriteResult = await apiClientRecordsRepository.batchWriteApiEntities(
      BATCH_SIZE,
      collections,
      handleCollectionWrites
    );

    if (!collectionWriteResult.success) {
      throw new Error(`Failed to import collections: ${collectionWriteResult.message}`);
    }

    const handleApiWrites = async (api: RQAPI.ApiRecord) => {
      const newCollectionId = collections.find((collection) => collection.id === api.collectionId)?.id;
      if (!newCollectionId) {
        throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
      }

      const updatedApi = { ...api, collectionId: newCollectionId };
      try {
        const newApi = await apiClientRecordsRepository.createRecordWithId(updatedApi, updatedApi.id);
        // for the cases where newApi.success is false
        // inside createRecordWithId we are already capturing the exception in sentry
        if (newApi.success) {
          onSaveRecord(newApi.data);
          importedApisCount++;
          return newApi.data.id;
        } else {
          failedCollectionsCount++;
          return null;
        }
      } catch (error) {
        failedCollectionsCount++;
        Logger.error("Error importing API:", error);
        return null;
      }
    };

    const apiWriteResult = await apiClientRecordsRepository.batchWriteApiEntities(BATCH_SIZE, apis, handleApiWrites);
    if (!apiWriteResult.success) {
      throw new Error(`Failed to import APIs: ${apiWriteResult.message}`);
    }

    if (failedCollectionsCount > 0) {
      const failureMessage =
        failedCollectionsCount > 0
          ? `${failedCollectionsCount} ${failedCollectionsCount > 1 ? "collections" : "collection"} failed`
          : "";
      if (failureMessage.length) {
        toast.warn(`Some imports failed: ${failureMessage}, Please contact support if the issue persists.`);
      }
    }

    return { importedCollectionsCount, importedApisCount };
  }, [processedFileData.apiRecords, onSaveRecord, apiClientRecordsRepository]);

  const handleImportPostmanData = useCallback(async () => {
    return wrapWithCustomSpan(
      {
        name: "[Transaction] api_client.postman_import.import_data",
        op: "api_client.postman_import.import_data",
        forceTransaction: true,
        attributes: {},
      },
      async () => {
        setIsImporting(true);
        await Promise.allSettled([handleImportEnvironments(), handleImportCollectionsAndApis()])
          .then((results) => {
            const [environmentsResult, collectionsResult] = results;

            if (collectionsResult.status === "rejected") {
              Sentry.withScope((scope) => {
                scope.setTag("error_type", "api_client_postman_import_collections_failed");
                Sentry.captureException(collectionsResult.reason);
              });
            }

            const importedEnvironments = environmentsResult.status === "fulfilled" ? environmentsResult.value : 0;
            const importedCollectionsCount =
              collectionsResult.status === "fulfilled" ? collectionsResult.value.importedCollectionsCount : 0;
            const importedApisCount =
              collectionsResult.status === "fulfilled" ? collectionsResult.value.importedApisCount : 0;

            const failedEnvironments = processedFileData.environments.length - importedEnvironments;
            const failedCollections = collectionsCount.current - importedCollectionsCount;

            if (!importedEnvironments && !importedCollectionsCount) {
              notification.error({
                message: "Failed to import Postman data",
                placement: "bottomRight",
              });
              Sentry.captureException(
                new Error("Failed to import Postman data. No environments or collections imported.")
              );
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_ERROR,
              });
              return;
            }

            const hasFailures = failedEnvironments > 0 || failedCollections > 0;
            const hasSuccesses = importedEnvironments > 0 || importedCollectionsCount > 0;

            if (hasFailures && hasSuccesses) {
              const failureMessage = [
                failedCollections > 0 ? `${failedCollections} collection${failedCollections !== 1 ? "s" : ""}` : "",
                failedEnvironments > 0 ? `${failedEnvironments} environment${failedEnvironments !== 1 ? "s" : ""}` : "",
              ]
                .filter(Boolean)
                .join(" and ");

              toast.warn(`Partial import success. Failed to import: ${failureMessage}`);
              Sentry.captureException(new Error(`Partial import success. Failed to import: ${failureMessage}`));
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_ERROR,
              });
              return;
            }

            toast.success(
              `Successfully imported ${[
                importedCollectionsCount > 0
                  ? `${importedCollectionsCount} collection${importedCollectionsCount !== 1 ? "s" : ""}`
                  : "",
                importedEnvironments > 0
                  ? `${importedEnvironments} environment${importedEnvironments !== 1 ? "s" : ""}`
                  : "",
              ]
                .filter(Boolean)
                .join(" and ")}`
            );

            onSuccess?.();
            trackImportSuccess(ApiClientImporterType.POSTMAN, importedCollectionsCount, importedApisCount);
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_OK,
            });
          })
          .catch((error) => {
            Logger.error("Postman data import failed:", error);
            setImportError("Something went wrong!, Couldn't import Postman data");
            trackImportFailed(ApiClientImporterType.POSTMAN, JSON.stringify(error));
            Sentry.withScope((scope) => {
              scope.setTag("error_type", "api_client_postman_import");
              Sentry.captureException(error);
            });
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_ERROR,
            });
          })
          .finally(() => {
            setIsImporting(false);
          });
      }
    )();
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
