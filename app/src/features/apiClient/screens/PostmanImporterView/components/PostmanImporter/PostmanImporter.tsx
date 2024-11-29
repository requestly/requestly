import React, { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FilePicker } from "components/common/FilePicker";
import {
  getUploadedPostmanFileType,
  processPostmanCollectionData,
  processPostmanEnvironmentData,
  processPostmanVariablesData,
} from "./utils";
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
  trackImportFromPostmanCompleted,
  trackImportFromPostmanDataProcessed,
  trackImportFromPostmanFailed,
  trackImportFromPostmanStarted,
} from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";
import "./postmanImporter.scss";

type ProcessedData = {
  environments: { name: string; variables: Record<string, EnvironmentVariableValue> }[];
  apiRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
  variables: Record<string, EnvironmentVariableValue>;
};

interface PostmanImporterProps {
  onSuccess?: () => void;
}

type ProcessingStatus = "idle" | "processing" | "processed";

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

  const { addNewEnvironment, setVariables } = useEnvironmentManager();
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
              const fileContent = JSON.parse(reader.result as string);

              if (!file.type.includes("json")) {
                throw new Error("Invalid file. Please upload valid Postman export files.");
              }

              const fileType = getUploadedPostmanFileType(fileContent);
              if (!fileType) {
                throw new Error("Invalid file. Please upload valid Postman export files.");
              }

              if (fileType === "environment") {
                const processedData = processPostmanEnvironmentData(fileContent);
                resolve({ type: fileType, data: processedData });
              } else {
                const processedApiRecords = processPostmanCollectionData(fileContent);
                const processedVariables = processPostmanVariablesData(fileContent);
                resolve({
                  type: fileType,
                  data: {
                    type: fileType,
                    apiRecords: processedApiRecords,
                    variables: processedVariables,
                  },
                });
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsText(file);
        });
      });

      Promise.allSettled(processFiles)
        .then((results) => {
          const hasErrors = results.every((result) => result.status === "rejected");
          if (hasErrors) {
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
              }
            }
          });

          trackImportFromPostmanDataProcessed(collectionsCount.current, processedRecords.environments.length);

          setProcessedFileData(processedRecords);
          setProcessingStatus("processed");
        })
        .catch((error) => {
          setImportError(error.message);
          setProcessingStatus("idle");
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
        const newEnvironment = await addNewEnvironment(`(Imported) ${env.name}`);
        if (newEnvironment) {
          await setVariables(newEnvironment.id, env.variables);
          return true;
        }
        return false;
      });

      const results = await Promise.allSettled(importPromises);
      return results.filter((result) => result.status === "fulfilled").length;
    } catch (error) {
      Logger.error("Postman data import failed:", error);
      throw error;
    }
  }, [addNewEnvironment, setVariables, processedFileData.environments]);

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;

    // Filter root collections and sub-collections
    const rootCollections = processedFileData.apiRecords.filter(
      (record) => record.type === RQAPI.RecordType.COLLECTION && record.collectionId === ""
    );
    const subCollections = processedFileData.apiRecords.filter(
      (record) => record.type === RQAPI.RecordType.COLLECTION && record.collectionId !== ""
    );
    const apis = processedFileData.apiRecords.filter((record) => record.type === RQAPI.RecordType.API);

    let oldToNewCollectionIds: Record<string, { newId: string }> = {};

    // Import root collections first
    const rootCollectionsPromises = rootCollections.map(async (collection) => {
      const collectionToImport = {
        ...collection,
        name: `(Imported) ${collection.name}`,
      };
      delete collectionToImport.id;
      try {
        const newCollection = await upsertApiRecord(user?.details?.profile?.uid, collectionToImport, workspace?.id);
        onSaveRecord(newCollection.data);
        importedCollectionsCount++;
        return {
          oldId: collection.id,
          newId: newCollection.data.id,
        };
      } catch (error) {
        failedCollectionsCount++;
        Logger.error("Error importing root collection:", error);
        return {
          oldId: collection.id,
          newId: null,
        };
      }
    });

    const rootCollectionsResult = await Promise.allSettled(rootCollectionsPromises);
    oldToNewCollectionIds = rootCollectionsResult.reduce((result, details) => {
      if (details.status === "fulfilled") {
        return {
          ...result,
          [details.value.oldId]: { newId: details.value.newId },
        };
      }
      return result;
    }, {});

    // Import sub-collections with updated parent collection IDs
    const subCollectionsPromises = subCollections.map(async (subCollection) => {
      const newCollectionId = oldToNewCollectionIds[subCollection.collectionId]?.newId;
      if (!newCollectionId) {
        Logger.error(`Failed to find new collection ID for sub-collection: ${subCollection.name || subCollection.id}`);
        failedCollectionsCount++;
        return { oldId: subCollection.id, newId: null };
      }

      const subCollectionToImport = {
        ...subCollection,
        name: `(Imported) ${subCollection.name}`,
        collectionId: newCollectionId, // Update to new parent collection ID
      };
      delete subCollectionToImport.id;
      try {
        const newSubCollection = await upsertApiRecord(
          user?.details?.profile?.uid,
          subCollectionToImport,
          workspace?.id
        );
        onSaveRecord(newSubCollection.data);
        importedCollectionsCount++;
        // Update the mapping for sub-collections as well for requests
        oldToNewCollectionIds[subCollection.id] = { newId: newSubCollection.data.id };
        return {
          oldId: subCollection.id,
          newId: newSubCollection.data.id,
        };
      } catch (error) {
        failedCollectionsCount++;
        Logger.error("Error importing sub-collection:", error);
        return {
          oldId: subCollection.id,
          newId: null,
        };
      }
    });

    await Promise.allSettled(subCollectionsPromises);

    // Import APIs with updated collection IDs
    await Promise.allSettled(
      apis.map(async (api) => {
        const apiToImport = { ...api };
        delete apiToImport.id;

        const newCollectionId = oldToNewCollectionIds[api.collectionId]?.newId;
        if (!newCollectionId) {
          throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
        }

        const updatedApi = { ...apiToImport, collectionId: newCollectionId };
        const newApi = await upsertApiRecord(user.details?.profile?.uid, updatedApi, workspace?.id);
        onSaveRecord?.(newApi.data);
      })
    );

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
  }, [processedFileData.apiRecords, user?.details?.profile?.uid, workspace?.id, onSaveRecord]);

  const handleImportVariables = useCallback(async () => {
    if (Object.keys(processedFileData.variables).length === 0) {
      return Promise.resolve();
    }
    const newEnvironment = await addNewEnvironment("(Imported) New Environment");
    if (newEnvironment) {
      return setVariables(newEnvironment.id, processedFileData.variables);
    }
    return Promise.resolve();
  }, [processedFileData.variables, setVariables, addNewEnvironment]);

  const handleImportPostmanData = useCallback(() => {
    trackImportFromPostmanStarted(collectionsCount.current, processedFileData.environments.length);
    setIsImporting(true);
    Promise.allSettled([handleImportEnvironments(), handleImportCollectionsAndApis(), handleImportVariables()])
      .then((results) => {
        const [environmentsResult, collectionsResult] = results;
        const importedEnvironments = environmentsResult.status === "fulfilled" ? environmentsResult.value : 0;
        const importedCollections = collectionsResult.status === "fulfilled" ? collectionsResult.value : 0;

        const failedEnvironments = processedFileData.environments.length - importedEnvironments;
        const failedCollections = collectionsCount.current - importedCollections;

        if (!importedEnvironments && !importedCollections) {
          toast.error("Failed to import Postman data");
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

        onSuccess?.();
        trackImportFromPostmanCompleted(importedCollections, importedEnvironments);
      })
      .catch((error) => {
        Logger.error("Postman data import failed:", error);
        setImportError("Something went wrong!, Couldn't import Postman data");
        trackImportFromPostmanFailed(collectionsCount.current, processedFileData.environments.length);
      })
      .finally(() => {
        setIsImporting(false);
      });
  }, [
    handleImportEnvironments,
    handleImportCollectionsAndApis,
    handleImportVariables,
    onSuccess,
    processedFileData.environments.length,
  ]);

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
          maxFiles={5}
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
