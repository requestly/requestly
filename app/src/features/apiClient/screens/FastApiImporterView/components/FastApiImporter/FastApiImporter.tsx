import React, { useCallback, useState } from "react";
import { fetchOpenApiSpec, processOpenApiData } from "./utils";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system-v2/components";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { ApiClientImporterType, RQAPI } from "features/apiClient/types";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { notification, Row, Tooltip, Input } from "antd";
import {
  trackImportFailed,
  trackImportParsed,
  trackImportParseFailed,
  trackImportSuccess,
} from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";
import "./fastApiImporter.scss";
import * as Sentry from "@sentry/react";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { useApiClientRepository } from "features/apiClient/slices";
import { wrapWithCustomSpan } from "utils/sentry";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";

const BATCH_SIZE = 25;

interface FastApiImporterProps {
  onSuccess?: () => void;
}

type ProcessingStatus = "idle" | "processing" | "processed";

export const FastApiImporter: React.FC<FastApiImporterProps> = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [processedFileData, setProcessedFileData] = useState<{
    apiRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
  }>({ apiRecords: [] });

  const { apiClientRecordsRepository } = useApiClientRepository();
  const { onSaveRecord } = useNewApiClientContext();

  const handleFetchAndParse = async () => {
    if (!url || !collectionName) {
      toast.error("Please enter both URL and Collection Name.");
      return;
    }

    setProcessingStatus("processing");
    setImportError(null);

    try {
      const { data, targetUrl } = await fetchOpenApiSpec(url);
      const parsedData = processOpenApiData(data, targetUrl, collectionName, apiClientRecordsRepository);

      setProcessedFileData({
        apiRecords: [...parsedData.collections, ...parsedData.apis],
      });

      trackImportParsed(ApiClientImporterType.FASTAPI, parsedData.collections.length, parsedData.apis.length);
      setProcessingStatus("processed");
    } catch (error: any) {
      Logger.error("Error processing FastAPI schema:", error);
      setImportError(error.message);
      trackImportParseFailed(ApiClientImporterType.FASTAPI, error.message);
      setProcessingStatus("idle");
    }
  };

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;
    let importedApisCount = 0;

    const collections = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.COLLECTION);
    const apis = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.API);

    const handleCollectionWrites = async (collection: RQAPI.CollectionRecord) => {
      try {
        const newCollection = await apiClientRecordsRepository.createCollectionFromImport(collection, collection.id);
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
      toast.warn(`Some imports failed. Please contact support if the issue persists.`);
    }

    return { importedCollectionsCount, importedApisCount };
  }, [processedFileData.apiRecords, onSaveRecord, apiClientRecordsRepository]);

  const handleImportFastApiData = useCallback(async () => {
    return wrapWithCustomSpan(
      {
        name: "[Transaction] api_client.fastapi_import.import_data",
        op: "api_client.fastapi_import.import_data",
        forceTransaction: true,
        attributes: {},
      },
      async () => {
        setIsImporting(true);
        try {
          const { importedCollectionsCount, importedApisCount } = await handleImportCollectionsAndApis();

          if (!importedCollectionsCount) {
            notification.error({
              message: "Failed to import FastAPI data",
              placement: "bottomRight",
            });
            Sentry.captureException(new Error("Failed to import FastAPI data. No collections imported."));
            Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_ERROR });
            return;
          }

          toast.success(
            `Successfully imported ${importedCollectionsCount} collection(s) and ${importedApisCount} API(s)`
          );

          onSuccess?.();
          trackImportSuccess(ApiClientImporterType.FASTAPI, importedCollectionsCount, importedApisCount);
          Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_OK });
        } catch (error: any) {
          Logger.error("FastAPI data import failed:", error);
          setImportError("Something went wrong! Couldn't import FastAPI data");
          trackImportFailed(ApiClientImporterType.FASTAPI, JSON.stringify(error));
          Sentry.withScope((scope) => {
            scope.setTag("error_type", "api_client_fastapi_import");
            Sentry.captureException(error);
          });
          Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_ERROR });
        } finally {
          setIsImporting(false);
        }
      }
    )();
  }, [handleImportCollectionsAndApis, onSuccess]);

  const handleResetImport = () => {
    setProcessingStatus("idle");
    setIsImporting(false);
    setImportError(null);
    setProcessedFileData({ apiRecords: [] });
    setUrl("");
    setCollectionName("");
  };

  const apisCount = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.API).length;

  return (
    <div className="fastapi-importer">
      <div className="fastapi-importer__header">
        <span>Import from FastAPI</span>
        <Tooltip title="Enter your FastAPI server URL to auto-generate an API Client Collection.">
          <MdInfoOutline className="postman-importer__header-info-icon" />
        </Tooltip>
      </div>

      {importError ? (
        <div className="fastapi-importer__post-parse-view fastapi-importer__post-parse-view--error">
          <div className="fastapi-importer__post-parse-view--error-text">
            <IoMdCloseCircleOutline /> Error fetching or parsing OpenAPI spec.
          </div>
          <div className="fastapi-importer__post-parse-view--error-text-steps">
            <div className="mt-8">Reason: {importError}</div>
          </div>
          <Row justify="end" className="w-full">
            <RQButton type="primary" onClick={handleResetImport} className="mt-8">
              Try Again
            </RQButton>
          </Row>
        </div>
      ) : processingStatus === "processed" ? (
        <div className="fastapi-importer__post-parse-view fastapi-importer__post-parse-view--success">
          <MdCheckCircleOutline />
          <div>
            Successfully parsed {apisCount} API{apisCount !== 1 ? "s" : ""} from the schema.
          </div>
          <RQButton type="primary" loading={isImporting} onClick={handleImportFastApiData}>
            Import
          </RQButton>
        </div>
      ) : (
        <div className="fastapi-importer__form">
          <div className="fastapi-importer__input-group">
            <label>FastAPI Server URL</label>
            <Input
              placeholder="e.g. https://api.example.com or https://api.example.com/docs"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={processingStatus === "processing"}
            />
          </div>
          <div className="fastapi-importer__input-group">
            <label>Collection Name</label>
            <Input
              placeholder="e.g. My FastAPI Backend"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              disabled={processingStatus === "processing"}
            />
          </div>
          <Row justify="end" className="mt-4">
            <RQButton
              type="primary"
              loading={processingStatus === "processing"}
              onClick={handleFetchAndParse}
              disabled={!url || !collectionName}
            >
              Fetch & Parse
            </RQButton>
          </Row>
        </div>
      )}
    </div>
  );
};
