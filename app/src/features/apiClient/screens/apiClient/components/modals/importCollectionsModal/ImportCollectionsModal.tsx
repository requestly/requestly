import React, { useCallback, useMemo, useState } from "react";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { FilePicker } from "components/common/FilePicker";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { RQButton } from "lib/design-system-v2/components";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";
import { processApiRecordsToImport, processVariablesToImport } from "./utils";
import { getCurrentEnvironmentId } from "store/features/environment/selectors";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQAPI } from "features/apiClient/types";
import { upsertApiRecord } from "backend/apiClient";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { useApiClientContext } from "features/apiClient/contexts";
import {
  trackImportApiCollectionsFailed,
  trackImportApiCollectionsStarted,
  trackImportApiCollectionsSuccessful,
} from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";
import "./importCollectionsModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportCollectionsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const user = useSelector(getUserAuthDetails);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const { setVariables, getCurrentEnvironmentVariables, getAllEnvironments } = useEnvironmentManager();
  const { onSaveRecord } = useApiClientContext();

  const [isDataProcessing, setIsDataProcessing] = useState(false);
  const [isParseComplete, setIsParseComplete] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiRecordsToImport, setApiRecordsToImport] = useState(null);
  const [variablesToImport, setVariablesToImport] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const existingVariables = useMemo(() => getCurrentEnvironmentVariables(), [getCurrentEnvironmentVariables]);
  const allEnvironments = useMemo(() => getAllEnvironments(), [getAllEnvironments]);

  const onFilesDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      const reader = new FileReader();

      reader.onabort = () => {
        setValidationError("Failed to import the selected file.");
        return;
      };

      reader.onerror = () => {
        setValidationError("Failed to import the selected file.");
        return;
      };

      reader.onload = () => {
        const fileContent = reader.result;
        setIsDataProcessing(true);

        if (!file.type.includes("json")) {
          setIsDataProcessing(false);
          setValidationError("Invalid file format. Please select a valid JSON export file.");
          return;
        }

        let parsedResult;
        try {
          parsedResult = JSON.parse(fileContent as string);
          if (!parsedResult.variables || !parsedResult.records) {
            setValidationError(
              "Failed to process the selected file.\nPlease select a valid API collections JSON export file."
            );
            return;
          }
          const result = processApiRecordsToImport(parsedResult.records, user.details?.profile?.uid);
          setApiRecordsToImport(result);
          const processedVariables = processVariablesToImport(parsedResult.variables, existingVariables);
          setVariablesToImport(processedVariables);
          setIsParseComplete(true);
        } catch (e) {
          setValidationError(
            "Failed to process the selected file. Please select a valid API collections JSON export file."
          );
        } finally {
          setIsDataProcessing(false);
        }
      };
      reader.readAsText(file);
    },
    [existingVariables, user.details?.profile?.uid]
  );

  const handleImportVariables = useCallback(async () => {
    if (!variablesToImport || allEnvironments.length === 0) return;
    await setVariables(currentEnvironmentId, variablesToImport);
  }, [variablesToImport, currentEnvironmentId, setVariables, allEnvironments]);

  const handleImportCollectionsAndApis = useCallback(async () => {
    if (!apiRecordsToImport) {
      setValidationError("No collections or APIs to import");
      throw new Error("No collections or APIs to import");
    }

    try {
      const collectionsPromises: Promise<{ oldId: string; newId: string }>[] = [];
      apiRecordsToImport.collections.forEach((collection: RQAPI.CollectionRecord) => {
        const collectionToImport = { ...collection, name: `${collection.name} (Imported)` };
        delete collectionToImport.id;
        const promise = upsertApiRecord(user?.details?.profile?.uid, collectionToImport, workspace?.id)
          .then((newCollection) => {
            onSaveRecord(newCollection.data);
            return {
              oldId: collection.id,
              newId: newCollection.data.id,
            };
          })
          .catch(() => {
            throw new Error(`Failed to import collection: ${collection.name || collection.id}`);
          });
        collectionsPromises.push(promise);
      });

      const collectionsPromisesResult = await Promise.all(collectionsPromises);
      const oldToNewCollectionDetails: Record<string, { newId: string }> = collectionsPromisesResult.reduce(
        (result, details) => ({
          ...result,
          [details.oldId]: { newId: details.newId },
        }),
        {}
      );

      const apisPromises: Promise<unknown>[] = [];
      apiRecordsToImport.apis.forEach((api: RQAPI.ApiRecord) => {
        const apiToImport = { ...api };
        delete apiToImport.id;
        const newCollectionId = oldToNewCollectionDetails[api.collectionId]?.newId;
        if (!newCollectionId) {
          throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
        }

        const updatedApi = { ...apiToImport, collectionId: newCollectionId };
        const promise = upsertApiRecord(user.details?.profile?.uid, updatedApi, workspace?.id)
          .then((newApi) => {
            onSaveRecord(newApi.data);
          })
          .catch(() => {
            throw new Error(`Failed to import API: ${api.name || api.id}`);
          });
        apisPromises.push(promise);
      });

      await Promise.all(apisPromises);
      toast.success("Collections and APIs imported successfully");
      trackImportApiCollectionsSuccessful(apiRecordsToImport?.count);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import collections and APIs");
      trackImportApiCollectionsFailed(apiRecordsToImport?.count);
      throw error;
    }
  }, [apiRecordsToImport, onSaveRecord, user.details?.profile?.uid, workspace?.id, apiRecordsToImport?.count]);

  const handleImport = useCallback(async () => {
    trackImportApiCollectionsStarted(apiRecordsToImport?.count);
    setIsImporting(true);
    setValidationError(null);

    try {
      await handleImportVariables();
      await handleImportCollectionsAndApis();

      onClose();
    } catch (error) {
      Logger.error("Import failed:", error);
    } finally {
      setIsImporting(false);
    }
  }, [handleImportVariables, handleImportCollectionsAndApis, onClose, apiRecordsToImport?.count]);

  return (
    <Modal
      className="import-collections-modal"
      open={isOpen}
      onCancel={() => {
        onClose();
        setValidationError(null);
        setIsParseComplete(false);
      }}
      title="Import collections"
      footer={null}
    >
      {validationError ? (
        <div className="collections-parsed-container">
          <MdErrorOutline className="collections-parse-result-icon error" />
          <div className="collections-import-error-text">{validationError}</div>
          <RQButton
            type="primary"
            onClick={() => {
              setValidationError(null);
            }}
          >
            Try another file
          </RQButton>
        </div>
      ) : isParseComplete ? (
        <div className="collections-parsed-container">
          <MdCheckCircleOutline className="collections-parse-result-icon success" />
          <div className="collections-parse-result-text">Collections parsed successfully</div>
          <RQButton type="primary" onClick={handleImport} loading={isImporting}>
            Import collections
          </RQButton>
        </div>
      ) : (
        <FilePicker
          maxFiles={1}
          onFilesDrop={(files) => {
            onFilesDrop(files);
          }}
          isProcessing={isDataProcessing}
          title="Browse or drop your API collections JSON file here"
          subtitle="Accepted file formats: JSON"
          selectorButtonTitle={isParseComplete || validationError ? "Try another file" : "Select file"}
        />
      )}
    </Modal>
  );
};
