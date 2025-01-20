import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import {
  trackExportApiCollectionsFailed,
  trackExportApiCollectionsStarted,
  trackExportApiCollectionsSuccessful,
} from "modules/analytics/events/features/apiClient";
import "./exportModal.scss";
import fileDownload from "js-file-download";
import { isEmpty, omit } from "lodash";
import { EnvironmentData } from "backend/environment/types";

interface ExportModalProps {
  collections?: RQAPI.CollectionRecord[];
  isOpen: boolean;
  onClose: () => void;
  environments?: EnvironmentData[];
  exportType?: "COL" | "ENV";
}

export interface ExportData {
  records?: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
  environments?: EnvironmentData[];
}

const COLLECTIONS_SCHEMA_VERSION = "1.0.0";

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  collections,
  environments,
  exportType = "COL",
}) => {
  const [isApiRecordsProcessed, setIsApiRecordsProcessed] = useState(false);
  const [exportData, setExportData] = useState<ExportData>(
    !isEmpty(collections) ? { records: [] } : !isEmpty(environments) ? { environments: [] } : {}
  );
  const [fileInfo, setFileInfo] = useState<{ label: string; type: string }>({ label: "", type: "" });

  const handleExport = useCallback(() => {
    const dataToExport = { schema_version: COLLECTIONS_SCHEMA_VERSION, ...exportData };

    trackExportApiCollectionsStarted(dataToExport.records?.length, dataToExport.environments?.length);
    try {
      const fileContent = JSON.stringify(dataToExport, null, 2);

      const fileName = `RQ-${fileInfo.label}-export-${getFormattedDate("DD_MM_YYYY")}.json`;
      fileDownload(fileContent, fileName, "application/json");
      onClose();
      trackExportApiCollectionsSuccessful(dataToExport.records?.length, dataToExport.environments?.length);
    } catch (error) {
      trackExportApiCollectionsFailed(dataToExport.records?.length, dataToExport.environments?.length);
    }
  }, [exportData, collections, environments, onClose, fileInfo.label]);

  const recordsToExport: { collections: RQAPI.CollectionRecord[]; apis: RQAPI.ApiRecord[] } = {
    collections: [],
    apis: [],
  };

  const sanitizeRecords = useCallback(
    (
      collection: RQAPI.CollectionRecord,
      recordsToExport: { collections: RQAPI.CollectionRecord[]; apis: RQAPI.ApiRecord[] }
    ) => {
      const sanitizeRecord = (record: any) => {
        const sanitizedRecord = { ...record };
        ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"].forEach((field) => {
          delete sanitizedRecord[field];
        });
        return sanitizedRecord;
      };

      recordsToExport.collections.push(sanitizeRecord({ ...collection, data: omit(collection.data, "children") }));
      collection.data.children.forEach((record) => {
        if (record.type === RQAPI.RecordType.API) {
          recordsToExport.apis.push(sanitizeRecord(record));
        } else {
          sanitizeRecords(record, recordsToExport);
        }
      });

      return recordsToExport;
    },
    []
  );

  const processEnvironments = useCallback((environments: EnvironmentData[]): EnvironmentData[] => {
    return environments.map((env) => {
      const updatedVariables = Object.keys(env.variables).reduce((acc, key) => {
        const { localValue, ...rest } = env.variables[key];
        acc[key] = rest;
        return acc;
      }, {} as typeof env.variables);

      return { ...env, variables: updatedVariables, isGlobal: env.id === "global" ? true : false };
    });
  }, []);

  useEffect(() => {
    if (!isOpen || isApiRecordsProcessed) return;

    if (exportType === "COL") {
      let processedRecords: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[] = [];

      collections.forEach((collection) => {
        const { collections: processedCollection, apis } = sanitizeRecords(collection, recordsToExport);

        processedRecords = processedRecords.concat(processedCollection);

        apis.forEach((api) => {
          processedRecords.push(api);
        });
      });

      setExportData({ records: processedRecords });
    } else {
      const processedEnvironments = processEnvironments(environments);
      setExportData({ environments: processedEnvironments });
    }
    setIsApiRecordsProcessed(true);
  }, [isOpen, collections, environments, isApiRecordsProcessed, sanitizeRecords, exportType]);

  useEffect(() => {
    if (exportType === "COL") {
      setFileInfo({ label: collections.length > 1 ? "Collections" : "Collection", type: "COL" });
    } else if (exportType === "ENV") {
      setFileInfo({ label: environments.length > 1 ? "Environments" : "Environment", type: "ENV" });
    }
  }, []);

  return (
    <Modal
      title={
        <div className="export-collections-modal-title">
          <MdOutlineFileDownload />
          Export {fileInfo.label}
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
            RQ{`-${fileInfo.label}`}-{getFormattedDate("DD_MM_YYYY")}
          </div>
          <div className="export-details">
            <div className="export-details-item">
              <span className="export-details-item-label">{fileInfo.label}: </span>
              <span className="export-details-item-value">
                {exportType === "ENV" ? environments.length : collections?.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
