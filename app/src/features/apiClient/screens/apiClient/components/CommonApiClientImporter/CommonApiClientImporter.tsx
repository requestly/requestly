import * as Sentry from "@sentry/react";
import React, { useCallback, useState } from "react";
import { FilePicker } from "components/common/FilePicker";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { Col } from "antd";
import { RQAPI, ApiClientImporterType } from "@requestly/shared/types/entities/apiClient";
import { ApiClientImporterMethod, ApiClientImporterOutput } from "@requestly/alternative-importers";
import { EnvironmentData } from "backend/environment/types";
import { toast } from "utils/Toast";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";
import { useCommand } from "features/apiClient/commands";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import {
  trackImportFailed,
  trackImportParsed,
  trackImportParseFailed,
  trackImportSuccess,
} from "modules/analytics/events/features/apiClient";
import "./commonApiClientImporter.scss";
import { ImportErrorView } from "./components/ImporterErrorView";
import { SuccessfulParseView } from "./components/SuccessfulParseView";
import { wrapWithCustomSpan } from "utils/sentry";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";

export interface ImportFile {
  content: string;
  name: string;
  type: string;
}

export interface CommonApiClientImporterProps {
  productName: string;
  supportedFileTypes: string[];
  importer: ApiClientImporterMethod<ImportFile>;
  importerType: ApiClientImporterType;
  onImportSuccess: () => void;
  docsLink?: string;
}

export const CommonApiClientImporter: React.FC<CommonApiClientImporterProps> = ({
  productName,
  supportedFileTypes,
  importer,
  importerType,
  onImportSuccess,
  docsLink,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [collectionsData, setCollectionsData] = useState<RQAPI.CollectionRecord[]>([]);
  const [environmentsData, setEnvironmentsData] = useState<EnvironmentData[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const {
    repositories: { apiClientRecordsRepository },
  } = getApiClientFeatureContext();
  const {
    env: { createEnvironment },
  } = useCommand();
  const { onSaveBulkRecords } = useNewApiClientContext();

  const handleResetImport = () => {
    setImportError(null);
    setIsParseComplete(false);
    setCollectionsData([]);
    setEnvironmentsData([]);
  };

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      return wrapWithCustomSpan(
        {
          name: `[Transaction] api_client.${importerType.toLowerCase()}_import.process_files`,
          op: `api_client.${importerType.toLowerCase()}_import.process_files`,
          forceTransaction: true,
          attributes: {},
        },
        async (files: File[]) => {
          setIsDataProcessing(true);
          const processFiles = files.map((file) => {
            return new Promise<ApiClientImporterOutput>((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => {
                reject(new Error("Could not process the selected files! Try again."));
              };
              reader.onload = () => {
                const fileContent = reader.result as string;
                importer({ content: fileContent, name: file.name, type: file.type })
                  .then((output) => resolve(output))
                  .catch(() => reject(new Error("Failed to parse specification file")));
              };
              reader.readAsText(file);
            });
          });

          await Promise.allSettled(processFiles)
            .then((results: PromiseSettledResult<ApiClientImporterOutput>[]) => {
              const hasAllFilesFailed = !results.some((result) => result.status === "fulfilled");
              if (hasAllFilesFailed) {
                throw new Error("Could not process the files! Please check if files are valid");
              }
              const processedResults: { collections: RQAPI.CollectionRecord[]; environments: EnvironmentData[] } = {
                collections: [],
                environments: [],
              };
              results.forEach((result) => {
                if (result.status === "fulfilled") {
                  processedResults.collections.push(result.value.data.collection);
                  processedResults.environments.push(...result.value.data.environments);
                }
              });
              if (processedResults.collections.length === 0 && processedResults.environments.length === 0) {
                throw new Error("Selected Files don't contain any collections or environments");
              }
              setCollectionsData(processedResults.collections);
              setEnvironmentsData(processedResults.environments);
              setIsParseComplete(true);
              trackImportParsed(importerType, processedResults.collections.length, null);
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_OK,
              });
            })
            .catch((error) => {
              setImportError(error.message || "Could not process the selected files! Try again.");
              trackImportParseFailed(importerType, error.message);
              Sentry.captureException(error);
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_ERROR,
              });
            })
            .finally(() => {
              setIsDataProcessing(false);
            });
        }
      )(files);
    },
    [importer, importerType]
  );

  const handleImportEnvironments = useCallback(
    async (environments: EnvironmentData[]) => {
      const importPromises = [];
      for (const environment of environments) {
        importPromises.push(
          createEnvironment({ newEnvironmentName: environment.name, variables: environment.variables })
        );
      }
      const importResults = await Promise.allSettled(importPromises);
      return importResults;
    },
    [createEnvironment]
  );

  //flatten a single root collection and create mapping
  const flattenRootCollection = useCallback(
    (
      rootCollection: RQAPI.CollectionRecord
    ): {
      flatCollections: RQAPI.CollectionRecord[];
      collectionToRequestsMap: Map<string, RQAPI.ApiRecord[]>;
    } => {
      const flatCollections: RQAPI.CollectionRecord[] = [];
      const collectionToRequestsMap = new Map<string, RQAPI.ApiRecord[]>();

      const traverse = (collection: RQAPI.CollectionRecord, parentCollectionId?: string) => {
        const newCollectionId = apiClientRecordsRepository.generateCollectionId(collection.name, parentCollectionId);
        const collectionToCreate = {
          ...collection,
          id: newCollectionId,
          collectionId: parentCollectionId || "",
        };

        flatCollections.push(collectionToCreate);

        if (collection.data?.children && collection.data.children.length > 0) {
          const requests: RQAPI.ApiRecord[] = [];

          collection.data.children.forEach((child) => {
            if (child.type === RQAPI.RecordType.COLLECTION) {
              traverse(child as RQAPI.CollectionRecord, newCollectionId);
            } else if (child.type === RQAPI.RecordType.API) {
              const apiRecord = child as RQAPI.ApiRecord;
              const newApiId = apiClientRecordsRepository.generateApiRecordId(newCollectionId);
              const updatedApiRecord = {
                ...apiRecord,
                id: newApiId,
                collectionId: newCollectionId,
              };
              requests.push(updatedApiRecord);
            }
          });

          if (requests.length > 0) {
            collectionToRequestsMap.set(newCollectionId, requests);
          }
        }
      };

      traverse(rootCollection);

      return { flatCollections, collectionToRequestsMap };
    },
    [apiClientRecordsRepository]
  );

  const createAllCollections = useCallback(
    async (
      flatCollections: RQAPI.CollectionRecord[]
    ): Promise<{
      successfulCollections: RQAPI.CollectionRecord[];
      failedCount: number;
    }> => {
      const successfulCollections: RQAPI.CollectionRecord[] = [];
      let failedCount = 0;

      /* 
      Iterating over collection sequentially because local sync if we create collections asyncronously,it may break if a sub-collection is created before its parent 
      */
      for (const collection of flatCollections) {
        try {
          const result = await apiClientRecordsRepository.createCollectionFromImport(collection, collection.id);
          if (result.success) {
            successfulCollections.push(collection);
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
        }
      }

      return { successfulCollections, failedCount };
    },
    [apiClientRecordsRepository]
  );

  const createAllRequests = useCallback(
    async (
      collectionToRequestsMap: Map<string, RQAPI.ApiRecord[]>
    ): Promise<{
      successfulRequests: RQAPI.ApiRecord[];
      failedCount: number;
    }> => {
      const allRequests: RQAPI.ApiRecord[] = [];
      collectionToRequestsMap.forEach((requests) => {
        allRequests.push(...requests);
      });

      if (allRequests.length === 0) {
        return { successfulRequests: [], failedCount: 0 };
      }

      try {
        const createdRequests = await apiClientRecordsRepository.batchWriteApiRecords(allRequests);

        return { successfulRequests: createdRequests, failedCount: 0 };
      } catch (error) {
        return { successfulRequests: [], failedCount: allRequests.length };
      }
    },
    [apiClientRecordsRepository]
  );

  const importRootCollection = useCallback(
    async (
      rootCollection: RQAPI.CollectionRecord
    ): Promise<{
      success: boolean;
      importedCount: number;
      failedCount: number;
      results: {
        collections: { successful: number; failed: number };
        requests: { successful: number; failed: number };
      } | null;
    }> => {
      try {
        const { flatCollections, collectionToRequestsMap } = flattenRootCollection(rootCollection);

        const { successfulCollections, failedCount: failedCollectionsCount } = await createAllCollections(
          flatCollections
        );
        onSaveBulkRecords(successfulCollections);

        const { successfulRequests, failedCount: failedRequestsCount } = await createAllRequests(
          collectionToRequestsMap
        );
        onSaveBulkRecords(successfulRequests);

        const totalImportedCount = successfulCollections.length + successfulRequests.length;
        const totalFailedCount = failedCollectionsCount + failedRequestsCount;
        const allSuccessful = totalFailedCount === 0;

        return {
          success: allSuccessful,
          importedCount: totalImportedCount,
          failedCount: totalFailedCount,
          results: {
            collections: {
              successful: successfulCollections.length,
              failed: failedCollectionsCount,
            },
            requests: {
              successful: 0,
              failed: 0,
            },
          },
        };
      } catch (error) {
        return {
          success: false,
          importedCount: 0,
          failedCount: 1,
          results: null,
        };
      }
    },
    [flattenRootCollection, createAllCollections, onSaveBulkRecords, createAllRequests]
  );

  const handleImportCollections = useCallback(
    async (collections: RQAPI.CollectionRecord[]) => {
      if (!collections || collections.length === 0) {
        return { success: true, importedCount: 0, failedCount: 0 };
      }

      try {
        const rootCollectionPromises = collections.map((rootCollection) => importRootCollection(rootCollection));

        const results = await Promise.allSettled(rootCollectionPromises);

        let totalSuccessfulCollections = 0;
        let totalFailedCollections = 0;
        let totalSuccessfulRequests = 0;
        let totalFailedRequests = 0;

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const collectionResult = result.value;

            if (collectionResult.results) {
              totalSuccessfulCollections += collectionResult.results.collections.successful;
              totalFailedCollections += collectionResult.results.collections.failed;
              totalSuccessfulRequests += collectionResult.results.requests.successful;
              totalFailedRequests += collectionResult.results.requests.failed;
            }
          } else {
            totalFailedCollections += 1;
          }
        });

        const allSuccessful = totalFailedCollections === 0;

        return {
          success: allSuccessful,
          importedCount: totalSuccessfulCollections,
          failedCount: totalFailedCollections,
          // Additional info, maybe required in future
          results: {
            collections: {
              successful: totalSuccessfulCollections,
              failed: totalFailedCollections,
            },
            requests: {
              successful: totalSuccessfulRequests,
              failed: totalFailedRequests,
            },
          },
        };
      } catch (error) {
        return {
          success: false,
          importedCount: 0,
          failedCount: collections.length,
          results: null,
        };
      }
    },
    [importRootCollection]
  );

  const handleImportData = useCallback(async () => {
    return wrapWithCustomSpan(
      {
        name: `[Transaction] api_client.${importerType.toLowerCase()}_import.import_data`,
        op: `api_client.${importerType.toLowerCase()}_import.import_data`,
        forceTransaction: true,
        attributes: {},
      },
      async () => {
        setIsLoading(true);
        try {
          const importPromises = [];
          importPromises.push(handleImportEnvironments(environmentsData));
          importPromises.push(handleImportCollections(collectionsData));
          const importResults = await Promise.allSettled(importPromises);

          const environmentResults = importResults[0];
          const collectionResults = importResults[1];

          let totalImported = 0;
          let totalFailed = 0;

          if (environmentResults.status === "fulfilled") {
            const envResults = environmentResults.value as PromiseSettledResult<{ id: string; name: string }>[];
            const successfulEnvironments = envResults.filter((result) => result.status === "fulfilled").length;
            totalImported += successfulEnvironments;
            totalFailed += envResults.length - successfulEnvironments;
          } else {
            totalFailed += environmentsData.length;
          }

          if (collectionResults.status === "fulfilled") {
            const collectionResult = collectionResults.value as {
              success: boolean;
              importedCount: number;
              failedCount: number;
            };
            totalImported += collectionResult.importedCount;
            totalFailed += collectionResult.failedCount;
          } else {
            totalFailed += collectionsData.length;
          }

          if (totalImported === 0) {
            setImportError("Failed to import collections and environments");
            Sentry.captureException(new Error("Failed to import collections and environments"));
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_ERROR,
            });
            return;
          }

          if (totalFailed === 0) {
            toast.success(
              `Successfully imported ${collectionsData.length} ${
                collectionsData.length !== 1 ? "collections" : "collection"
              } and ${environmentsData.length} ${environmentsData.length !== 1 ? "environments" : "environment"}`
            );
            trackImportSuccess(importerType, collectionsData.length, null);
            onImportSuccess();
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_OK,
            });
          } else {
            toast.warn(
              `Partially imported: ${totalImported} succeeded, ${totalFailed} failed. Please review your files.`
            );
            trackImportSuccess(importerType, totalImported, null);
            onImportSuccess();
            Sentry.captureException(new Error("Partially imported collections and environments"));
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_ERROR,
            });
          }
        } catch (e) {
          setImportError("Failed to import collections and environments");
          trackImportFailed(importerType, e.message);
          Sentry.captureException(e);
          Sentry.getActiveSpan()?.setStatus({
            code: SPAN_STATUS_ERROR,
          });
        } finally {
          setIsLoading(false);
        }
      }
    )();
  }, [
    collectionsData,
    environmentsData,
    handleImportEnvironments,
    handleImportCollections,
    onImportSuccess,
    importerType,
  ]);

  const HeaderComponent: React.FC<{}> = () => {
    return (
      <div className="common-api-client-importer-header">
        <Col className="importer-header-heading">Import {productName}</Col>
        {/* <CopyButton icon={<LinkOutlined />} type={"transparent"} title={"Share"} copyText={props.shareLink} /> */}
      </div>
    );
  };

  const FooterComponent: React.FC<{}> = () => {
    if (!docsLink) {
      return null;
    }
    return (
      <div className="common-importer-footer">
        To export your collections from {productName},{"  "}
        <a target="_blank" rel="noreferrer" href={docsLink}>
          Follow these steps
          <div className="icon__wrapper">
            <HiOutlineExternalLink />
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className={`common-api-client-importer-container`}>
      <HeaderComponent />
      <div className="common-api-client-importer-body">
        {isParseComplete ? (
          <SuccessfulParseView
            collectionsData={collectionsData}
            environmentsData={environmentsData}
            isLoading={isLoading}
            handleImportData={handleImportData}
          />
        ) : (
          <>
            {importError ? <ImportErrorView importError={importError} /> : null}
            <FilePicker
              maxFiles={5}
              onFilesDrop={(files) => {
                handleResetImport();
                handleFileDrop(files);
              }}
              isProcessing={isDataProcessing}
              title={`Drag and drop your ${productName} export file to upload`}
              subtitle={`Accepted file formats: ${supportedFileTypes.join(", ")}`}
              selectorButtonTitle={isParseComplete || importError ? "Try another file" : "Select file"}
            />
          </>
        )}
      </div>
      <FooterComponent />
    </div>
  );
};
