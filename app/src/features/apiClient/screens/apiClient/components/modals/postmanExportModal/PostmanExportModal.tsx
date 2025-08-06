import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
import { getFormattedDate } from "utils/DateTimeUtils";
import "./postmanExportModal.scss";
import fileDownload from "js-file-download";
import { omit } from "lodash";
import { isApiCollection } from "../../../utils";
import {
  trackExportApiCollectionsFailed,
  trackExportCollectionsClicked,
} from "modules/analytics/events/features/apiClient";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { postmanCollectionExporter } from "@requestly/alternative-importers";

interface PostmanExportModalProps {
  recordsToBeExported: RQAPI.Record[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportRecord = Omit<RQAPI.Record, "createdBy" | "updatedBy" | "ownerId" | "createdTs" | "updatedTs">;

interface RequestlyExportData {
  schema_version: string;
  records: ExportRecord[];
}

const COLLECTIONS_SCHEMA_VERSION = "1.0.0";

export const PostmanExportModal: React.FC<PostmanExportModalProps> = ({ recordsToBeExported, isOpen, onClose }) => {
  const [isApiRecordsProcessed, setIsApiRecordsProcessed] = useState(false);
  const [exportData, setExportData] = useState<RequestlyExportData>({
    schema_version: COLLECTIONS_SCHEMA_VERSION,
    records: [],
  });
  const [fileInfo, setFileInfo] = useState<{ label: string; type: string }>({ label: "", type: "" });

  const handleExport = useCallback(() => {
    try {
      // Convert Requestly collection to Postman format
      const postmanCollection = postmanCollectionExporter(exportData);

      const fileContent = JSON.stringify(postmanCollection, null, 2);
      const fileName = `Postman-${fileInfo.label}-export-${getFormattedDate("DD_MM_YYYY")}.json`;

      fileDownload(fileContent, fileName, "application/json");
      trackExportCollectionsClicked();
      onClose();
    } catch (error) {
      console.error("Error exporting to Postman format:", error);
      trackExportApiCollectionsFailed(exportData.records?.length, 0);
    }
  }, [exportData, fileInfo.label, onClose]);

  const sanitizeRecord = (record: RQAPI.Record): ExportRecord =>
    omit(record, ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"]);

  const sanitizeRecords = useCallback((collection: RQAPI.CollectionRecord, recordsToExport: ExportRecord[]) => {
    recordsToExport.push(
      sanitizeRecord({ ...collection, data: omit(collection.data, "children") }) as RQAPI.CollectionRecord
    );
    if (collection.data.children) {
      collection.data.children.forEach((record: RQAPI.Record) => {
        if (record.type === RQAPI.RecordType.API) {
          recordsToExport.push(sanitizeRecord(record) as ExportRecord);
        } else {
          sanitizeRecords(record, recordsToExport);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen || isApiRecordsProcessed) return;

    const recordsToExport: ExportRecord[] = [];

    recordsToBeExported.forEach((record) => {
      if (isApiCollection(record)) {
        sanitizeRecords(record, recordsToExport);
      } else {
        recordsToExport.push({ ...sanitizeRecord(record), collectionId: "" });
      }
    });

    setExportData({
      schema_version: COLLECTIONS_SCHEMA_VERSION,
      records: recordsToExport,
    });
    setIsApiRecordsProcessed(true);
  }, [isOpen, recordsToBeExported, isApiRecordsProcessed, sanitizeRecords]);

  useEffect(() => {
    setFileInfo({
      label: recordsToBeExported.length > 1 ? "Collections" : "Collection",
      type: "COL",
    });
  }, [recordsToBeExported.length]);

  return (
    <Modal
      title={
        <div className="postman-export-modal-title">
          <MdOutlineIosShare />
          Export to Postman
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      className="custom-rq-modal postman-export-modal"
      onOk={handleExport}
      okText="Export to Postman"
    >
      <div className="postman-export-modal-content">
        <div className="export-details-card">
          <div className="export-name">
            Postman-{fileInfo.label}-{getFormattedDate("DD_MM_YYYY")}
          </div>
          <div className="export-details">
            <div className="export-details-item">
              <span className="export-details-item-label">{fileInfo.label}: </span>
              <span className="export-details-item-value">{recordsToBeExported?.length}</span>
            </div>
            <div className="export-details-item">
              <span className="export-details-item-label">Format: </span>
              <span className="export-details-item-value">Postman Collection v2.1</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
