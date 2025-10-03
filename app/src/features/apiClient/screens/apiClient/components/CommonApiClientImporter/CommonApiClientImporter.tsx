import React, { useCallback, useMemo, useState } from "react";
import { FilePicker } from "components/common/FilePicker";
import { InfoCircleOutlined } from "@ant-design/icons";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { RQAPI, ApiClientImporterType } from "@requestly/shared/types/entities/apiClient";
import { ApiClientImporterMethod, ApiClientImporterOutput } from "@requestly/alternative-importers";
import { EnvironmentData } from "backend/environment/types";
import { toast } from "utils/Toast";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";
import { useCommand } from "features/apiClient/commands";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { ParsedEntityCollapse } from "./components/ParsedEntityCollapse/ParsedEntityCollapse";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import {
  trackImportFailed,
  trackImportParsed,
  trackImportParseFailed,
  trackImportSuccess,
} from "modules/analytics/events/features/apiClient";
import "./commonApiClientImporter.scss";

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
  const { onSaveRecord } = useNewApiClientContext();

  const handleResetImport = () => {
    setImportError(null);
    setIsParseComplete(false);
    setCollectionsData(undefined);
    setEnvironmentsData([]);
  };

  const onFilesDrop = async (files: File[]) => {
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
        setCollectionsData(processedResults.collections);
        setEnvironmentsData(processedResults.environments);
        setIsParseComplete(true);
        trackImportParsed(importerType, processedResults.collections.length, null);
      })
      .catch((error) => {
        setImportError(error.message || "Could not process the selected files! Try again.");
        trackImportParseFailed(importerType, error.message);
      })
      .finally(() => {
        setIsDataProcessing(false);
      });
  };

  const handleImportEnvironments = useCallback(
    async (environments: EnvironmentData[]) => {
      const importPromises = [];
      for (const environment of environments) {
        importPromises.push(
          createEnvironment({ newEnvironmentName: environment.name, variables: environment.variables })
        );
      }
      const importResults = await Promise.allSettled(importPromises);
      console.log("importResults", importResults);
      return importResults;
    },
    [createEnvironment]
  );

  //flatten collections and create mapping
  const flattenCollectionsAndMapRequests = useCallback(
    (
      collections: RQAPI.CollectionRecord[]
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

      collections.forEach((collection) => traverse(collection));

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
      const collectionPromises = flatCollections.map(async (collection) => {
        try {
          const result = await apiClientRecordsRepository.createCollectionFromImport(collection, collection.id);
          if (result.success) {
            onSaveRecord(result.data);
            return { success: true, collection };
          } else {
            return { success: false, collection };
          }
        } catch (error) {
          return { success: false, collection };
        }
      });

      const results = await Promise.allSettled(collectionPromises);
      console.log("results", results);
      const successfulCollections: RQAPI.CollectionRecord[] = [];
      let failedCount = 0;

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.success) {
          successfulCollections.push(result.value.collection);
        } else {
          failedCount++;
        }
      });

      return { successfulCollections, failedCount };
    },
    [apiClientRecordsRepository, onSaveRecord]
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

        createdRequests.forEach((request) => {
          onSaveRecord(request);
        });

        return { successfulRequests: createdRequests, failedCount: 0 };
      } catch (error) {
        return { successfulRequests: [], failedCount: allRequests.length };
      }
    },
    [apiClientRecordsRepository, onSaveRecord]
  );

  const handleImportCollections = useCallback(
    async (collections: RQAPI.CollectionRecord[]) => {
      if (!collections || collections.length === 0) {
        return { success: true, importedCount: 0, failedCount: 0 };
      }

      try {
        const { flatCollections, collectionToRequestsMap } = flattenCollectionsAndMapRequests(collections);

        const { successfulCollections, failedCount: failedCollectionsCount } = await createAllCollections(
          flatCollections
        );

        const { successfulRequests, failedCount: failedRequestsCount } = await createAllRequests(
          collectionToRequestsMap
        );

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
              successful: successfulRequests.length,
              failed: failedRequestsCount,
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
    [flattenCollectionsAndMapRequests, createAllCollections, createAllRequests]
  );

  const handleImportData = useCallback(async () => {
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
        setImportError("Failed to import data");
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
      } else {
        toast.error(`Successfully imported ${totalImported} items, but ${totalFailed} failed`);
      }
    } catch (e) {
      setImportError("Failed to import data");
      trackImportFailed(importerType, e.message);
    } finally {
      console.log("finally");
      setIsLoading(false);
    }
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

  const ImporterComponent: React.FC<{}> = () => {
    return (
      <>
        {importError ? <ImportErrorComponent /> : null}
        <FilePicker
          maxFiles={5}
          onFilesDrop={(files) => {
            handleResetImport();
            onFilesDrop(files);
          }}
          isProcessing={isDataProcessing}
          title={`Drag and drop your ${productName} export file to upload`}
          subtitle={`Accepted file formats: ${supportedFileTypes.join(", ")}`}
          selectorButtonTitle={isParseComplete || importError ? "Try another file" : "Select file"}
        />
      </>
    );
  };

  const ProcessedSuccessComponent = useMemo(
    () => () => {
      return (
        <>
          <div className="imported-entities-container">
            <ParsedEntityCollapse
              title="Collections"
              icon={<CgStack className="check-outlined-icon" />}
              count={collectionsData.length}
            >
              {collectionsData.map((collection) => (
                <div key={collection.id}>{collection.name}</div>
              ))}
            </ParsedEntityCollapse>
            <ParsedEntityCollapse
              title="Environments"
              icon={<MdHorizontalSplit className="check-outlined-icon" />}
              count={environmentsData.length}
            >
              {environmentsData.map((environment) => (
                <div key={environment.id}>{environment.name}</div>
              ))}
            </ParsedEntityCollapse>
          </div>
          <Row justify="end" className="importer-actions-row">
            <RQButton type="primary" loading={isLoading} onClick={handleImportData}>
              Import
            </RQButton>
          </Row>
        </>
      );
    },
    [collectionsData, environmentsData, handleImportData, isLoading]
  );

  const ImportErrorComponent: React.FC<{}> = () => {
    return (
      <div className="import-error">
        <div className="import-error-heading">
          <InfoCircleOutlined className="icon__wrapper" />
          {importError}.
        </div>
      </div>
    );
  };

  return (
    <div className={`common-api-client-importer-container`}>
      <HeaderComponent />
      <div className="common-api-client-importer-body">
        {isParseComplete ? <ProcessedSuccessComponent /> : <ImporterComponent />}
      </div>
      <FooterComponent />
    </div>
  );
};
