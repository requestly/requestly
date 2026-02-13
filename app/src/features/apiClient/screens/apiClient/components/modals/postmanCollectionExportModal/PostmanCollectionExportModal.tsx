import React, { useCallback, useEffect, useState } from "react";
import { Alert, Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
import { getFormattedDate } from "utils/DateTimeUtils";
import { toast } from "utils/Toast";
import "./postmanExportModal.scss";
import fileDownload from "js-file-download";
import { omit } from "lodash";
import { isApiCollection, isApiRequest } from "../../../utils";
import {
  trackExportApiCollectionsFailed,
  trackExportCollectionsClicked,
} from "modules/analytics/events/features/apiClient";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { postmanCollectionExporter } from "@requestly/alternative-importers";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

interface PostmanExportModalProps {
  recordsToBeExported: RQAPI.ApiClientRecord[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportRecord = Omit<RQAPI.ApiClientRecord, "createdBy" | "updatedBy" | "ownerId" | "createdTs" | "updatedTs">;

interface RequestlyExportData {
  schema_version: string;
  records: ExportRecord[];
}

const COLLECTIONS_SCHEMA_VERSION = "1.0.0";

export const PostmanExportModal: React.FC<PostmanExportModalProps> = ({ recordsToBeExported, isOpen, onClose }) => {
  const [isApiRecordsProcessed, setIsApiRecordsProcessed] = useState(false);
  const [hasGraphQLRequests, setHasGraphQLRequests] = useState(false);
  const [exportData, setExportData] = useState<RequestlyExportData>({
    schema_version: COLLECTIONS_SCHEMA_VERSION,
    records: [],
  });

  const fileInfo = {
    label: recordsToBeExported.length > 1 ? "Collections" : "Collection",
    type: "COL",
  };

  const handleExport = useCallback(async () => {
    try {
      // Convert Requestly collection to Postman format
      const result = await postmanCollectionExporter(exportData);

      if (result.type === "multiple") {
        // Multiple collections - will return ZIP
        const multipleResult = result as { type: "multiple"; zipData: any };
        const blob = new Blob([multipleResult.zipData], { type: "application/zip" });
        const fileName = `Postman-${fileInfo.label}-export-${getFormattedDate("DD_MM_YYYY")}.zip`;

        // Create a download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (result.type === "single") {
        // Single collection - return JSON
        const singleResult = result as { type: "single"; collection: any };
        const fileContent = JSON.stringify(singleResult.collection, null, 2);
        const fileName = `Postman-${fileInfo.label}-export-${getFormattedDate("DD_MM_YYYY")}.json`;
        fileDownload(fileContent, fileName, "application/json");
      } else {
        throw new Error(`Unexpected result type: ${(result as any).type}`);
      }

      trackExportCollectionsClicked();
      onClose();
    } catch (error) {
      toast.error("Failed to export collections. Please try again.");
      trackExportApiCollectionsFailed(exportData.records?.length, 0);
    }
  }, [exportData, fileInfo.label, onClose]);

  const sanitizeRecord = (record: RQAPI.ApiClientRecord): ExportRecord =>
    omit(record, ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"]);

  const sanitizeRecords = useCallback((collection: RQAPI.CollectionRecord): ExportRecord[] => {
    const records: ExportRecord[] = [];

    // Add the collection itself (without children)
    records.push(sanitizeRecord({ ...collection, data: omit(collection.data, "children") }) as RQAPI.CollectionRecord);

    // Recursively process children
    if (collection.data.children) {
      collection.data.children.forEach((record: RQAPI.ApiClientRecord) => {
        if (record.type === RQAPI.RecordType.API) {
          records.push(sanitizeRecord(record) as ExportRecord);
        } else {
          records.push(...sanitizeRecords(record));
        }
      });
    }

    return records;
  }, []);

  useEffect(() => {
    const recordsToExport: ExportRecord[] = [];

    apiRecordsRankingManager.sort(recordsToBeExported).forEach((record) => {
      if (isApiCollection(record)) {
        recordsToExport.push(...sanitizeRecords(record));
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
    if (exportData.records.length) {
      const hasGraphQLRequest = exportData.records.some(
        (record) =>
          isApiRequest(record as RQAPI.ApiClientRecord) &&
          (record.data as RQAPI.ApiEntry).type === RQAPI.ApiEntryType.GRAPHQL
      );
      setHasGraphQLRequests(hasGraphQLRequest);
    }
  }, [exportData.records]);

  return (
    <Modal
      title={
        <div className="postman-export-modal-title">
          <MdOutlineIosShare />
          Export as Postman (v2.1 format)
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      className="custom-rq-modal postman-export-modal"
      onOk={handleExport}
      okText="Export"
    >
      <div className="postman-export-modal-content">
        {hasGraphQLRequests && (
          <Alert description="GraphQL exports are not supported yet. Coming soon!" type="warning" />
        )}
        <div className="export-details-card">
          <div className="export-name">
            Postman-{fileInfo.label}-{getFormattedDate("DD_MM_YYYY")}
            {recordsToBeExported?.length > 1 ? ".zip" : ".json"}
          </div>
          <div className="export-details">
            <div className="export-details-item">
              <span className="export-details-item-label">{fileInfo.label}: </span>
              <span className="export-details-item-value">{recordsToBeExported?.length}</span>
            </div>
            <div className="export-details-item">
              <span className="export-details-item-label">Format: </span>
              <span className="export-details-item-value">
                {recordsToBeExported?.length > 1 ? "ZIP Archive" : "Postman Collection v2.1"}
              </span>
            </div>
            {recordsToBeExported?.length > 1 && (
              <div className="export-details-item">
                <span className="export-details-item-label">Note: </span>
                <span className="export-details-item-value">
                  Multiple collections will be exported as separate JSON files in a ZIP archive
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
