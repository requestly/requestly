import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
// import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import "./apiClientExportModal.scss";
import fileDownload from "js-file-download";
import { omit } from "lodash";
import { EnvironmentData } from "backend/environment/types";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { isApiCollection } from "../../../utils";
import {
  trackEnvironmentExported,
  trackExportApiCollectionsFailed,
  trackExportCollectionsClicked,
} from "modules/analytics/events/features/apiClient";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportCollectionsModalProps extends BaseModalProps {
  recordsToBeExported: RQAPI.Record[];
  exportType: "collection";
}

interface ExportEnvironmentsModalProps extends BaseModalProps {
  environments: EnvironmentData[];
  exportType: "environment";
}

type ExportModalProps = ExportCollectionsModalProps | ExportEnvironmentsModalProps;

type ExportRecord = Omit<RQAPI.Record, "createdBy" | "updatedBy" | "ownerId" | "createdTs" | "updatedTs">;

export interface ExportData {
  records?: ExportRecord[];
  environments?: EnvironmentData[];
}

const COLLECTIONS_SCHEMA_VERSION = "1.0.0";

export const ApiClientExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, exportType, ...props }) => {
  const { recordsToBeExported = [] } = props as ExportCollectionsModalProps;
  const { environments = [] } = props as ExportEnvironmentsModalProps;

  const [isApiRecordsProcessed, setIsApiRecordsProcessed] = useState(false);
  const [exportData, setExportData] = useState<ExportData>(
    exportType === "collection" ? { records: [] } : exportType === "environment" ? { environments: [] } : {}
  );
  const [fileInfo, setFileInfo] = useState<{ label: string; type: string }>({ label: "", type: "" });

  const recordsToExport: ExportRecord[] = [];

  const handleExport = useCallback(() => {
    const dataToExport = { schema_version: COLLECTIONS_SCHEMA_VERSION, ...exportData };

    try {
      const fileContent = JSON.stringify(dataToExport, null, 2);

      const fileName = `RQ-${fileInfo.label}-export-${getFormattedDate("DD_MM_YYYY")}.json`;
      fileDownload(fileContent, fileName, "application/json");
      exportType === "collection" ? trackExportCollectionsClicked() : trackEnvironmentExported();
      onClose();
    } catch (error) {
      trackExportApiCollectionsFailed(dataToExport.records?.length, dataToExport.environments?.length);
    }
  }, [exportData, recordsToBeExported, environments, onClose, fileInfo.label]);

  const sanitizeRecord = (record: RQAPI.Record): ExportRecord =>
    omit(record, ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"]);

  const sanitizeRecords = useCallback((collection: RQAPI.CollectionRecord, recordsToExport: ExportRecord[]) => {
    recordsToExport.push(
      sanitizeRecord({ ...collection, data: omit(collection.data, "children") }) as RQAPI.CollectionRecord
    );
    collection.data.children.forEach((record: RQAPI.Record) => {
      if (record.type === RQAPI.RecordType.API) {
        recordsToExport.push(sanitizeRecord(record) as ExportRecord);
      } else {
        sanitizeRecords(record, recordsToExport);
      }
    });
  }, []);

  const processEnvironments = useCallback((environments: EnvironmentData[]): EnvironmentData[] => {
    return environments.map((env) => {
      const updatedVariables = Object.keys(env.variables).reduce((acc, key) => {
        const { localValue, ...rest } = env.variables[key];
        acc[key] = rest;
        return acc;
      }, {} as typeof env.variables);

      return { ...env, variables: updatedVariables, isGlobal: isGlobalEnvironment(env.id) };
    });
  }, []);

  useEffect(() => {
    if (!isOpen || isApiRecordsProcessed) return;

    if (exportType === "collection") {
      recordsToBeExported.forEach((record) => {
        if (isApiCollection(record)) {
          sanitizeRecords(record, recordsToExport);
        } else {
          recordsToExport.push({ ...sanitizeRecord(record), collectionId: "" });
        }
      });

      setExportData({ records: recordsToExport });
    } else {
      const processedEnvironments = processEnvironments(environments);
      setExportData({ environments: processedEnvironments });
    }
    setIsApiRecordsProcessed(true);
  }, [isOpen, recordsToBeExported, environments, isApiRecordsProcessed, sanitizeRecords, exportType]);

  useEffect(() => {
    if (exportType === "collection") {
      setFileInfo({ label: recordsToBeExported.length > 1 ? "Collections" : "Collection", type: "COL" });
    } else if (exportType === "environment") {
      setFileInfo({ label: environments.length > 1 ? "Environments" : "Environment", type: "ENV" });
    }
  }, [exportType, setFileInfo, recordsToBeExported.length, environments.length]);

  return (
    <Modal
      title={
        <div className="export-collections-modal-title">
          <MdOutlineIosShare />
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
                {exportType === "environment" ? environments.length : recordsToBeExported?.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
