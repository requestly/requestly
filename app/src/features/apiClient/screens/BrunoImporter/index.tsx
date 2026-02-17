import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { EnvironmentVariableData } from "@requestly/shared/types/entities/apiClient";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import * as Sentry from "@sentry/react";
import { notification, Row } from "antd";
import { FilePicker } from "components/common/FilePicker";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { createEnvironment, getApiClientFeatureContext, useApiClientRepository } from "features/apiClient/slices";
import { ApiClientImporterType, RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { RQModal } from "lib/design-system/components";
import Logger from "lib/logger";
import {
  trackImportFailed,
  trackImportParsed,
  trackImportParseFailed,
  trackImportSuccess,
} from "modules/analytics/events/features/apiClient";
import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { redirectToApiClient } from "utils/RedirectionUtils";
import { wrapWithCustomSpan } from "utils/sentry";
import { toast } from "utils/Toast";
import "./brunoImporter.scss";
import { processBrunoCollectionData } from "./utils";

interface BrunoImporterProps {
  onSuccess?: () => void;
}

type ProcessingStatus = "idle" | "processing" | "processed";
const BATCH_SIZE = 25;

export const BrunoImporter: React.FC<BrunoImporterProps> = ({ onSuccess }) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [processedFileData, setProcessedFileData] = useState<{
    collections: Partial<RQAPI.CollectionRecord>[];
    apis: Partial<RQAPI.ApiRecord>[];
    environments: Array<{
      name: string;
      variables: Record<string, EnvironmentVariableData>;
    }>;
  }>({ collections: [], apis: [], environments: [] });

  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository, environmentVariablesRepository } = useApiClientRepository();
  const { dispatch } = getApiClientFeatureContext().store;

  const collectionsCount = useRef(0);

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      return wrapWithCustomSpan(
        {
          name: "[Transaction] api_client.bruno_import.process_files",
          op: "api_client.bruno_import.process_files",
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
                    throw new Error("Invalid file. Please upload valid Bruno export files.");
                  }

                  const fileContent = JSON.parse(reader.result as string);
                  // Basic validation for Bruno files
                  if (!fileContent.name || !fileContent.items) {
                    throw new Error("Invalid Bruno collection format");
                  }

                  const processedData = processBrunoCollectionData(fileContent, apiClientRecordsRepository);
                  resolve({ data: processedData });
                } catch (error) {
                  console.error("Error processing Bruno file:", error);
                  reject(error);
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
                  "Could not process the selected files! Please check if the files are valid Bruno export files."
                );
              }

              const processedRecords = {
                collections: [] as Partial<RQAPI.CollectionRecord>[],
                apis: [] as Partial<RQAPI.ApiRecord>[],
                environments: [] as Array<{
                  name: string;
                  variables: Record<string, EnvironmentVariableData>;
                }>,
              };

              results.forEach((result: any) => {
                if (result.status === "fulfilled") {
                  const { collections, apis, environments } = result.value.data;
                  processedRecords.collections.push(...collections);
                  processedRecords.apis.push(...apis);
                  processedRecords.environments.push(...environments);
                  collectionsCount.current += collections.length;
                  trackImportParsed(
                    ApiClientImporterType.BRUNO,
                    processedRecords.collections.length,
                    processedRecords.apis.length
                  );
                }
              });

              setProcessedFileData(processedRecords);
              setProcessingStatus("processed");
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_OK,
              });
            })
            .catch((error) => {
              trackImportParseFailed(ApiClientImporterType.BRUNO, error.message);
              setImportError(error.message);
              setProcessingStatus("idle");

              Sentry.withScope((scope) => {
                scope.setTag("error_type", "api_client_bruno_processing");
                Sentry.captureException(error);
              });
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_ERROR,
              });
            });
        }
      )(files);
    },
    [apiClientRecordsRepository]
  );

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;
    let importedApisCount = 0;
    let failedApisCount = 0;

    const { collections, apis } = processedFileData;

    const handleCollectionWrites = async (collection: RQAPI.CollectionRecord) => {
      try {
        const newCollection = await apiClientRecordsRepository.createCollectionFromImport(collection, collection.id);
        // for the cases newCollection.success is false
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
      // for the cases where newApi.success is false
      // inside createRecordWithId we are already capturing the exception in sentry
      if (!newCollectionId) {
        throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
      }

      const updatedApi = { ...api, collectionId: newCollectionId };
      try {
        const newApi = await apiClientRecordsRepository.createRecordWithId(updatedApi, updatedApi.id);
        if (newApi.success) {
          onSaveRecord(newApi.data);
          importedApisCount++;
          return;
        } else {
          failedApisCount++;
        }
      } catch (error) {
        failedApisCount++;
        Logger.error("Error importing API:", error);
      }
    };

    const apiWriteResult = await apiClientRecordsRepository.batchWriteApiEntities(BATCH_SIZE, apis, handleApiWrites);
    if (!apiWriteResult.success) {
      throw new Error(`Failed to import APIs: ${apiWriteResult.message}`);
    }

    if (failedCollectionsCount > 0 || failedApisCount > 0) {
      toast.warn(
        `Failed to import ${
          failedCollectionsCount + failedApisCount
        } items. Please contact support if the issue persists.`
      );
    }

    return { importedCollectionsCount, importedApisCount };
  }, [processedFileData, onSaveRecord, apiClientRecordsRepository]);

  const handleImportEnvironments = useCallback(async () => {
    let importedEnvCount = 0;

    try {
      const importPromises = processedFileData.environments.map(async (env) => {
        await dispatch(
          createEnvironment({
            name: env.name,
            variables: env.variables,
            repository: environmentVariablesRepository,
          }) as any
        ).unwrap();
        return true;
      });

      await Promise.all(importPromises);
      return importedEnvCount;
    } catch (error) {
      Logger.error("Environment import failed:", error);
      return importedEnvCount;
    }
  }, [processedFileData.environments, dispatch, environmentVariablesRepository]);

  const handleImportBrunoData = useCallback(async () => {
    return wrapWithCustomSpan(
      {
        name: "[Transaction] api_client.bruno_import.import_data",
        op: "api_client.bruno_import.import_data",
        forceTransaction: true,
        attributes: {},
      },
      async () => {
        setIsImporting(true);
        Promise.all([handleImportEnvironments(), handleImportCollectionsAndApis()])
          .then(([importedEnvs, recordsResult]) => {
            if (
              recordsResult.importedApisCount === 0 &&
              importedEnvs === 0 &&
              recordsResult.importedCollectionsCount === 0
            ) {
              notification.error({
                message: "Failed to import Bruno data",
                placement: "bottomRight",
              });
              return;
            }

            const successMessage = [
              recordsResult.importedApisCount + recordsResult.importedCollectionsCount > 0
                ? `${recordsResult.importedApisCount + recordsResult.importedCollectionsCount} collection(s) and api(s)`
                : null,
              importedEnvs > 0 ? `${importedEnvs} environment(s)` : null,
            ]
              .filter(Boolean)
              .join(" and ");

            toast.success(`Successfully imported ${successMessage}`);

            trackImportSuccess(
              ApiClientImporterType.BRUNO,
              recordsResult.importedCollectionsCount,
              recordsResult.importedApisCount
            );
            onSuccess?.();
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_OK,
            });
          })
          .catch((error) => {
            Logger.error("Bruno data import failed:", error);
            setImportError("Something went wrong! Couldn't import Bruno data");
            trackImportFailed(ApiClientImporterType.BRUNO, JSON.stringify(error));
            Sentry.withScope((scope) => {
              scope.setTag("error_type", "api_client_bruno_import");
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
  }, [handleImportEnvironments, handleImportCollectionsAndApis, onSuccess]);

  const handleResetImport = () => {
    setProcessingStatus("idle");
    setIsImporting(false);
    setImportError(null);
    setProcessedFileData({ collections: [], apis: [], environments: [] });
    collectionsCount.current = 0;
  };

  return (
    <div className="bruno-importer">
      <div className="bruno-importer__header">
        <span>Import from Bruno</span>
      </div>
      {importError ? (
        <div className="bruno-importer__post-parse-view bruno-importer__post-parse-view--error">
          <div className="bruno-importer__post-parse-view--error-text">
            <IoMdCloseCircleOutline /> {importError}
          </div>
          <Row justify="end" className="w-full">
            <RQButton type="primary" onClick={handleResetImport} className="mt-8">
              Import other files
            </RQButton>
          </Row>
        </div>
      ) : processingStatus === "processed" ? (
        <div className="bruno-importer__post-parse-view bruno-importer__post-parse-view--success">
          <MdCheckCircleOutline />
          <div>Successfully processed {collectionsCount.current} collection(s)</div>
          <RQButton type="primary" loading={isImporting} onClick={handleImportBrunoData}>
            Import
          </RQButton>
        </div>
      ) : (
        <FilePicker
          maxFiles={1000}
          onFilesDrop={handleFileDrop}
          isProcessing={processingStatus === "processing"}
          title="Drop your Bruno collections export files here"
          subtitle="Accepted file format: Bruno JSON export file"
          selectorButtonTitle="Select file"
        />
      )}
    </div>
  );
};

export const BrunoImporterView = () => {
  const navigate = useNavigate();
  return (
    <div className="bruno-importer-view">
      <div className="bruno-importer-view_content">
        <BrunoImporter onSuccess={() => redirectToApiClient(navigate)} />
      </div>
    </div>
  );
};

interface BrunoImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrunoImporterModal: React.FC<BrunoImporterModalProps> = ({ isOpen, onClose }) => {
  return (
    <RQModal open={isOpen} onCancel={onClose} footer={null} width={600}>
      <BrunoImporter onSuccess={onClose} />
    </RQModal>
  );
};
