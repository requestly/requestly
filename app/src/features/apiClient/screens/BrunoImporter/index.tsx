import React, { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FilePicker } from "components/common/FilePicker";
import { processBrunoCollectionData } from "./utils";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system-v2/components";
import { RQAPI } from "features/apiClient/types";
import { upsertApiRecord } from "backend/apiClient";
import { useApiClientContext } from "features/apiClient/contexts";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { Row } from "antd";
import Logger from "lib/logger";
import { batchWrite } from "backend/utils";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import "./brunoImporter.scss";
import { EnvironmentVariableValue } from "backend/environment/types";
import { useNavigate } from "react-router-dom";
import { redirectToApiClient } from "utils/RedirectionUtils";
import { RQModal } from "lib/design-system/components";
import {
  trackImportFromBrunoCompleted,
  trackImportFromBrunoDataProcessed,
  trackImportFromBrunoFailed,
  trackImportFromBrunoStarted,
} from "modules/analytics/events/features/apiClient";

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
      variables: Record<string, EnvironmentVariableValue>;
    }>;
  }>({ collections: [], apis: [], environments: [] });

  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const { onSaveRecord } = useApiClientContext();
  const { addNewEnvironment, setVariables } = useEnvironmentManager();

  const collectionsCount = useRef(0);

  const handleFileDrop = useCallback((files: File[]) => {
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

            const processedData = processBrunoCollectionData(fileContent);
            resolve({ data: processedData });
          } catch (error) {
            console.error("Error processing Bruno file:", error);
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
            "Could not process the selected files! Please check if the files are valid Bruno export files."
          );
        }

        const processedRecords = {
          collections: [] as Partial<RQAPI.CollectionRecord>[],
          apis: [] as Partial<RQAPI.ApiRecord>[],
          environments: [] as Array<{
            name: string;
            variables: Record<string, EnvironmentVariableValue>;
          }>,
        };

        results.forEach((result: any) => {
          if (result.status === "fulfilled") {
            const { collections, apis, environments } = result.value.data;
            processedRecords.collections.push(...collections);
            processedRecords.apis.push(...apis);
            processedRecords.environments.push(...environments);
            collectionsCount.current += collections.length;
          }
        });
        setProcessedFileData(processedRecords);
        setProcessingStatus("processed");
        trackImportFromBrunoDataProcessed(collectionsCount.current, processedRecords.environments.length);
      })
      .catch((error) => {
        setImportError(error.message);
        setProcessingStatus("idle");
      });
  }, []);

  const handleImportCollectionsAndApis = useCallback(async () => {
    let importedCollectionsCount = 0;
    let failedCollectionsCount = 0;

    const { collections, apis } = processedFileData;

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
      toast.warn(`Failed to import ${failedCollectionsCount} items. Please contact support if the issue persists.`);
    }

    return importedCollectionsCount;
  }, [processedFileData, user?.details?.profile?.uid, workspace?.id, onSaveRecord]);

  const handleImportEnvironments = useCallback(async () => {
    let importedEnvCount = 0;

    try {
      const importPromises = processedFileData.environments.map(async (env) => {
        const newEnvironment = await addNewEnvironment(env.name);
        if (newEnvironment) {
          await setVariables(newEnvironment.id, env.variables);
          importedEnvCount++;
        }
      });

      await Promise.all(importPromises);
      return importedEnvCount;
    } catch (error) {
      Logger.error("Environment import failed:", error);
      return importedEnvCount;
    }
  }, [processedFileData.environments, addNewEnvironment, setVariables]);

  const handleImportBrunoData = useCallback(() => {
    setIsImporting(true);
    trackImportFromBrunoStarted(collectionsCount.current, processedFileData.environments.length);
    Promise.all([handleImportEnvironments(), handleImportCollectionsAndApis()])
      .then(([importedEnvs, importedCollections]) => {
        if (importedCollections === 0 && importedEnvs === 0) {
          toast.error("Failed to import Bruno data");
          return;
        }

        const successMessage = [
          importedCollections > 0 ? `${importedCollections} collection(s)` : null,
          importedEnvs > 0 ? `${importedEnvs} environment(s)` : null,
        ]
          .filter(Boolean)
          .join(" and ");

        toast.success(`Successfully imported ${successMessage}`);
        trackImportFromBrunoCompleted(importedCollections, importedEnvs);
        onSuccess?.();
      })
      .catch((error) => {
        Logger.error("Bruno data import failed:", error);
        setImportError("Something went wrong! Couldn't import Bruno data");
        trackImportFromBrunoFailed(collectionsCount.current, processedFileData.environments.length);
      })
      .finally(() => {
        setIsImporting(false);
      });
  }, [processedFileData.environments.length, handleImportEnvironments, handleImportCollectionsAndApis, onSuccess]);

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
