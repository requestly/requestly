import * as Sentry from "@sentry/react";
import React, { useCallback, useState } from "react";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { Col, Tooltip } from "antd";
import { RQAPI, ApiClientImporterType, EnvironmentData } from "@requestly/shared/types/entities/apiClient";
import { ApiClientImporterMethod } from "@requestly/alternative-importers";
import { toast } from "utils/Toast";
import {
  apiRecordsActions,
  createEnvironment,
  getApiClientFeatureContext,
  useApiClientRepository,
} from "features/apiClient/slices";
import { trackImportFailed, trackImportSuccess } from "modules/analytics/events/features/apiClient";
import "./commonApiClientImporter.scss";
import { SuccessfulParseView, SuccessfulParseViewProps } from "./components/SuccessfulParseView";
import { wrapWithCustomSpan } from "utils/sentry";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import { ImportInputView, ImportFile, LinkViewConfig } from "./components/ImportInputView";

export type { ImportFile, LinkViewConfig };

export interface CommonApiClientImporterProps {
  productName: string;
  supportedFileTypes: string[];
  importer: ApiClientImporterMethod<ImportFile>;
  importerType: ApiClientImporterType;
  onImportSuccess: () => void;
  docsLink?: string;
  linkView?: LinkViewConfig;
  renderSuccessView?: (props: SuccessfulParseViewProps) => React.ReactNode;
}

export const CommonApiClientImporter: React.FC<CommonApiClientImporterProps> = ({
  productName,
  supportedFileTypes,
  importer,
  importerType,
  onImportSuccess,
  docsLink,
  linkView,
  renderSuccessView,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [collectionsData, setCollectionsData] = useState<RQAPI.CollectionRecord[]>([]);
  const [environmentsData, setEnvironmentsData] = useState<EnvironmentData[]>([]);

  const { environmentVariablesRepository, apiClientRecordsRepository } = useApiClientRepository();
  const { dispatch } = getApiClientFeatureContext().store;

  const handleResetImport = () => {
    setIsParseComplete(false);
    setCollectionsData([]);
    setEnvironmentsData([]);
  };

  const handleImportEnvironments = useCallback(
    async (environments: EnvironmentData[]) => {
      const importPromises = environments.map(async (environment) => {
        await dispatch(
          createEnvironment({
            name: environment.name,
            variables: environment.variables,
            repository: environmentVariablesRepository,
          }) as any
        ).unwrap();
        return true;
      });
      const results = await Promise.allSettled(importPromises);
      return results;
    },
    [dispatch, environmentVariablesRepository]
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
    async (collectionToRequestsMap: Map<string, RQAPI.ApiRecord[]>) => {
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

        dispatch(apiRecordsActions.upsertRecords(successfulCollections));

        const { successfulRequests, failedCount: failedRequestsCount } = await createAllRequests(
          collectionToRequestsMap
        );

        dispatch(apiRecordsActions.upsertRecords(successfulRequests));

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
    [flattenRootCollection, createAllCollections, dispatch, createAllRequests]
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

  const handleImportData = useCallback(
    async (collectionsOverride?: RQAPI.CollectionRecord[], environmentsOverride?: EnvironmentData[]) => {
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
            const collectionsToImport = collectionsOverride || collectionsData;
            const environmentsToImport = environmentsOverride || environmentsData;

            const importPromises = [];
            importPromises.push(handleImportEnvironments(environmentsToImport));
            importPromises.push(handleImportCollections(collectionsToImport));
            const importResults = await Promise.allSettled(importPromises);

            const environmentResults = importResults[0];
            const collectionResults = importResults[1];

            let totalImported = 0;
            let totalFailed = 0;

            if (environmentResults && environmentResults.status === "fulfilled") {
              const envResults = environmentResults.value as PromiseSettledResult<{ id: string; name: string }>[];
              const successfulEnvironments = envResults.filter((result) => result.status === "fulfilled").length;
              totalImported += successfulEnvironments;
              totalFailed += envResults.length - successfulEnvironments;
            } else {
              totalFailed += environmentsToImport.length;
            }

            if (collectionResults && collectionResults.status === "fulfilled") {
              const collectionResult = collectionResults.value as {
                success: boolean;
                importedCount: number;
                failedCount: number;
              };
              totalImported += collectionResult.importedCount;
              totalFailed += collectionResult.failedCount;
            } else {
              totalFailed += collectionsToImport.length;
            }

            if (totalImported === 0) {
              Sentry.captureException(new Error("Failed to import collections and environments"));
              Sentry.getActiveSpan()?.setStatus({
                code: SPAN_STATUS_ERROR,
              });
              return;
            }

            if (totalFailed === 0) {
              toast.success(
                `Successfully imported ${collectionsToImport.length} ${
                  collectionsToImport.length !== 1 ? "collections" : "collection"
                } and ${environmentsToImport.length} ${
                  environmentsToImport.length !== 1 ? "environments" : "environment"
                }`
              );
              trackImportSuccess(importerType, totalImported, null);
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
    },
    [
      collectionsData,
      environmentsData,
      handleImportEnvironments,
      handleImportCollections,
      onImportSuccess,
      importerType,
    ]
  );

  const HeaderComponent: React.FC<{}> = () => {
    return (
      <div className="common-api-client-importer-header">
        <Col className="importer-header-heading">
          Import {productName}
          {docsLink && (
            <Tooltip title={`Learn more about importing ${productName}`}>
              <a href={docsLink} target="_blank" rel="noreferrer">
                <MdInfoOutline className="importer-header-info-icon" />
              </a>
            </Tooltip>
          )}
        </Col>
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

  const handleDataProcessed = useCallback(
    (data: { collections: RQAPI.CollectionRecord[]; environments: EnvironmentData[] }) => {
      setCollectionsData(data.collections);
      setEnvironmentsData(data.environments);
      setIsParseComplete(true);
    },
    []
  );

  return (
    <div className={`common-api-client-importer-container`}>
      <HeaderComponent />
      <div className="common-api-client-importer-body">
        {isParseComplete ? (
          renderSuccessView ? (
            renderSuccessView({
              collectionsData,
              environmentsData,
              isLoading,
              handleImportData,
              onBack: handleResetImport,
            })
          ) : (
            <SuccessfulParseView
              collectionsData={collectionsData}
              environmentsData={environmentsData}
              isLoading={isLoading}
              handleImportData={handleImportData}
              onBack={handleResetImport}
            />
          )
        ) : (
          <ImportInputView
            productName={productName}
            supportedFileTypes={supportedFileTypes}
            linkView={linkView}
            importer={importer}
            importerType={importerType}
            onDataProcessed={handleDataProcessed}
          />
        )}
      </div>
      <FooterComponent />
    </div>
  );
};
