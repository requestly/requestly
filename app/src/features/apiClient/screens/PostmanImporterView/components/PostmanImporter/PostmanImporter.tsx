import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { Row } from "antd";
import "./postmanImporter.scss";

type ProcessedData = {
  environments: Array<{ name: string; variables: Record<string, EnvironmentVariableValue> }>;
  apiRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
  variables: Record<string, EnvironmentVariableValue>;
};

interface PostmanImporterProps {
  isOpenedInModal?: boolean;
  onImportComplete?: () => void;
}

export const PostmanImporter: React.FC<PostmanImporterProps> = ({ isOpenedInModal = false, onImportComplete }) => {
  const navigate = useNavigate();
  const [isDataProcessing, setIsDataProcessing] = useState(false);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [processedFiles, setProcessedData] = useState<ProcessedData>({
    environments: [],
    apiRecords: [],
    variables: {},
  });

  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const { addNewEnvironment, setVariables } = useEnvironmentManager();
  const { onSaveRecord } = useApiClientContext();

  const collectionsCount = useRef(0);

  const handleFileDrop = useCallback((files: File[]) => {
    setIsDataProcessing(true);
    setImportError(null);

    const processFiles = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error("Could not process the selected file!"));

        reader.onload = () => {
          try {
            const fileContent = JSON.parse(reader.result as string);

            if (!file.type.includes("json")) {
              throw new Error("Failed to process Postman collection or environment file.");
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
              console.log({ processedApiRecords });
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
          const error = results.find((result) => result.status === "rejected")?.reason;
          throw error || new Error("Failed to process files");
        }

        const processed: ProcessedData = {
          environments: [],
          apiRecords: [],
          variables: {},
        };

        results.forEach((result: any) => {
          if (result.status === "fulfilled") {
            if (result.value.type === "environment") {
              processed.environments.push(result.value.data);
            } else {
              const { collections, apis } = result.value.data.apiRecords;
              processed.variables = { ...processed.variables, ...result.value.data.variables };
              processed.apiRecords.push(...collections, ...apis);
              collectionsCount.current += collections.length;
            }
          }
        });

        setProcessedData(processed);
        setIsDataProcessed(true);
      })
      .catch((error) => {
        console.log({ error });
        setImportError(error.message);
        setIsDataProcessed(false);
      })
      .finally(() => {
        setIsDataProcessing(false);
      });
  }, []);

  const handleImportEnvironment = useCallback(async () => {
    try {
      const importPromises = processedFiles.environments.map(async (env) => {
        const newEnvironment = await addNewEnvironment(`(Imported) ${env.name}`);
        if (newEnvironment) {
          return setVariables(newEnvironment.id, env.variables);
        }
        return Promise.resolve();
      });

      return Promise.all(importPromises);
    } catch (error) {
      console.error("Import failed:", error);
      throw error;
    }
  }, [addNewEnvironment, setVariables, processedFiles.environments]);

  const handleImportCollectionsAndApis = useCallback(async () => {
    const collections = processedFiles.apiRecords.filter((record) => record.type === RQAPI.RecordType.COLLECTION);
    const apis = processedFiles.apiRecords.filter((record) => record.type === RQAPI.RecordType.API);

    // Import collections first
    const collectionsPromises = collections.map(async (collection) => {
      const collectionToImport = {
        ...collection,
        name: `(Imported) ${collection.name}`,
      };
      delete collectionToImport.id;

      const newCollection = await upsertApiRecord(user?.details?.profile?.uid, collectionToImport, workspace?.id);
      onSaveRecord?.(newCollection.data);
      return {
        oldId: collection.id,
        newId: newCollection.data.id,
      };
    });

    const collectionsResult = await Promise.all(collectionsPromises);
    const oldToNewCollectionIds: Record<string, { newId: string }> = collectionsResult.reduce(
      (result, details) => ({
        ...result,
        [details.oldId]: { newId: details.newId },
      }),
      {}
    );

    // Import APIs with updated collection IDs
    const apisPromises = apis.map(async (api) => {
      const apiToImport = { ...api };
      delete apiToImport.id;

      const newCollectionId = oldToNewCollectionIds[api.collectionId]?.newId;
      if (!newCollectionId) {
        throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
      }

      const updatedApi = { ...apiToImport, collectionId: newCollectionId };
      const newApi = await upsertApiRecord(user.details?.profile?.uid, updatedApi, workspace?.id);
      onSaveRecord?.(newApi.data);
    });

    await Promise.all(apisPromises);
  }, [processedFiles.apiRecords, user?.details?.profile?.uid, workspace?.id, onSaveRecord]);

  const handleImportVariables = useCallback(async () => {
    if (Object.keys(processedFiles.variables).length === 0) {
      return Promise.resolve();
    }
    const newEnvironment = await addNewEnvironment("(Imported) New Environment");
    if (newEnvironment) {
      return setVariables(newEnvironment.id, processedFiles.variables);
    }
    return Promise.resolve();
  }, [processedFiles.variables, setVariables, addNewEnvironment]);

  const handleImportPostmanData = useCallback(() => {
    setIsImporting(true);
    Promise.allSettled([handleImportEnvironment(), handleImportCollectionsAndApis(), handleImportVariables()])
      .then(() => {
        toast.success("Postman data imported successfully");
        onImportComplete?.();
      })
      .catch((error) => {
        setImportError("Something went wrong!, Couldn't import Postman data");
      })
      .finally(() => {
        setIsImporting(false);
      });
  }, [navigate, handleImportEnvironment, handleImportCollectionsAndApis, handleImportVariables, onImportComplete]);

  const handleResetImport = () => {
    setIsDataProcessed(false);
    setIsDataProcessing(false);
    setIsImporting(false);
    setImportError(null);
    setProcessedData({
      environments: [],
      apiRecords: [],
      variables: {},
    });
    collectionsCount.current = 0;
  };

  console.log({ processedFiles });

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
      ) : isDataProcessed ? (
        <div className="postman-importer__post-parse-view postman-importer__post-parse-view--success">
          <MdCheckCircleOutline />
          <div>
            Successfully processed{" "}
            {collectionsCount.current > 0 &&
              `${collectionsCount.current} collection${collectionsCount.current !== 1 ? "s" : ""}`}
            {collectionsCount.current > 0 && processedFiles.environments.length > 0 && " and "}
            {processedFiles.environments.length > 0 &&
              `${processedFiles.environments.length} environment${processedFiles.environments.length !== 1 ? "s" : ""}`}
          </div>
          <RQButton type="primary" loading={isImporting} onClick={handleImportPostmanData}>
            Import
          </RQButton>
        </div>
      ) : (
        <FilePicker
          maxFiles={5}
          onFilesDrop={handleFileDrop}
          isProcessing={isDataProcessing}
          title="Drop your Postman collections or environments export files here"
          subtitle="Accepted file formats: Postman v2 or v2.1 JSON file"
          selectorButtonTitle="Select file"
        />
      )}
    </div>
  );
};
