import React, { useCallback, useEffect, useState } from "react";
import { Checkbox, Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
import { extractVariableNameFromStringIfExists } from "backend/environment/utils";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import { isArray } from "lodash";
import { VariableExport } from "backend/environment/types";
import {
  trackExportApiCollectionsFailed,
  trackExportApiCollectionsStarted,
  trackExportApiCollectionsSuccessful,
} from "modules/analytics/events/features/apiClient";
import "./exportCollectionsModal.scss";
import fileDownload from "js-file-download";

interface ExportCollectionsModalProps {
  collections: RQAPI.CollectionRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export interface ExportData {
  variables: VariableExport[];
  records: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
}

const COLLECTIONS_SCHEMA_VERSION = "1.0.0";

export const ExportCollectionsModal: React.FC<ExportCollectionsModalProps> = ({ isOpen, onClose, collections }) => {
  const [isApiRecordsProcessed, setIsApiRecordsProcessed] = useState(false);
  const [exportData, setExportData] = useState<ExportData>({ variables: [], records: [] });
  const [isExportVariablesChecked, setIsExportVariablesChecked] = useState(true);
  const { getVariableData } = useEnvironmentManager();

  const handleExport = useCallback(() => {
    const dataToExport = { schema_version: COLLECTIONS_SCHEMA_VERSION, ...exportData };
    if (!isExportVariablesChecked) {
      dataToExport.variables = [];
    }
    trackExportApiCollectionsStarted(dataToExport.records.length);
    try {
      const fileContent = JSON.stringify(dataToExport, null, 2);
      const fileName = `RQ-${collections.length === 1 ? "collection" : "collections"}-export-${getFormattedDate(
        "DD_MM_YYYY"
      )}.json`;
      fileDownload(fileContent, fileName, "application/json");
      onClose();
      trackExportApiCollectionsSuccessful(dataToExport.records.length);
    } catch (error) {
      trackExportApiCollectionsFailed(dataToExport.records.length);
    }
  }, [exportData, isExportVariablesChecked, collections, onClose]);

  const extractVariablesFromAPIRecord = useCallback(
    (api: RQAPI.ApiRecord) => {
      const variables = new Set<string>();
      const apiRequest = api.data.request;

      const checkAndAddVariable = (value: string) => {
        const variableNames = extractVariableNameFromStringIfExists(value);
        if (variableNames) {
          variableNames.forEach((variable) => variables.add(variable));
        }
      };

      apiRequest.headers?.forEach(({ key, value }) => {
        checkAndAddVariable(key);
        checkAndAddVariable(value);
      });

      apiRequest.queryParams?.forEach(({ key, value }) => {
        checkAndAddVariable(key);
        checkAndAddVariable(value);
      });

      checkAndAddVariable(apiRequest.url);

      if (isArray(apiRequest.body)) {
        apiRequest.body.forEach((body) => {
          checkAndAddVariable(body.value);
        });
      } else {
        checkAndAddVariable(apiRequest.body || "");
      }

      return Array.from(variables).map(getVariableData).filter(Boolean);
    },
    [getVariableData]
  );

  const sanitizeApiRecords = useCallback((collection: RQAPI.CollectionRecord) => {
    const sanitizeRecord = (record: any) => {
      const sanitizedRecord = { ...record };
      ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"].forEach((field) => {
        delete sanitizedRecord[field];
      });
      return sanitizedRecord;
    };

    const collectionToExport = sanitizeRecord({ ...collection, data: {} });
    const apis = collection.data.children.map((api) => sanitizeRecord(api));

    return {
      collection: collectionToExport,
      apis,
    };
  }, []);

  useEffect(() => {
    if (!isOpen || isApiRecordsProcessed) return;

    const extractedVariablesSet = new Set();
    const processedApiRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[] = [];

    collections.forEach((collection) => {
      const { collection: processedCollection, apis } = sanitizeApiRecords(collection);
      processedApiRecords.push(processedCollection);

      apis.forEach((api) => {
        processedApiRecords.push(api);
        const variables: VariableExport[] = extractVariablesFromAPIRecord(api as RQAPI.ApiRecord);
        variables.forEach((variable) => extractedVariablesSet.add(JSON.stringify(variable)));
      });
    });

    const extractedVariables = Array.from(extractedVariablesSet).map((variable: string) =>
      JSON.parse(variable)
    ) as VariableExport[];
    setExportData({ variables: extractedVariables, records: processedApiRecords });
    setIsApiRecordsProcessed(true);
  }, [isOpen, collections, extractVariablesFromAPIRecord, isApiRecordsProcessed, sanitizeApiRecords]);

  return (
    <Modal
      title={
        <div className="export-collections-modal-title">
          <MdOutlineFileDownload />
          Export {collections.length > 1 ? "Collections" : "Collection"}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      className="custom-rq-modal export-collections-modal"
      onOk={handleExport}
      okText="Export"
    >
      <div className="export-collections-modal-content">
        <div className="export-details-card">
          <div className="export-name">
            RQ{collections.length === 1 ? "-collection" : "-collections"}-{getFormattedDate("DD_MM_YYYY")}
          </div>
          <div className="export-details">
            <div className="export-details-item">
              <span className="export-details-item-label">Collections: </span>
              <span className="export-details-item-value">{collections.length}</span>
            </div>
            {exportData.variables.length >= 1 && (
              <div className="export-details-item">
                <span className="export-details-item-label">Variables used: </span>
                <span className="export-details-item-value">{exportData.variables.length}</span>
              </div>
            )}
          </div>
        </div>
        {exportData.variables.length >= 1 && (
          <div className="export-var-checkbox-container">
            <Checkbox
              checked={isExportVariablesChecked}
              onChange={(e) => setIsExportVariablesChecked(e.target.checked)}
            />{" "}
            Export the variables used in the APIs of{" "}
            {collections.length === 1 ? "this collection" : "these collections"}
          </div>
        )}
      </div>
    </Modal>
  );
};
