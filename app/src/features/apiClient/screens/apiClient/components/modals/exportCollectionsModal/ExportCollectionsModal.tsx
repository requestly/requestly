import React, { useCallback, useEffect, useState } from "react";
import { Checkbox, Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
import { extractVariableNameFromStringIfExists } from "backend/environment/utils";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import { isArray } from "lodash";
import { VariableExport } from "backend/environment/types";
import "./exportCollectionsModal.scss";

interface Props {
  collections: RQAPI.CollectionRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export interface ExportData {
  variables: VariableExport[];
  records: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[];
}

export const ExportCollectionsModal: React.FC<Props> = ({ isOpen, onClose, collections }) => {
  const [isCollectionsProcessed, setIsCollectionsProcessed] = useState(false);
  const [exportData, setExportData] = useState<ExportData>({ variables: [], records: [] });
  const [isExportVariablesChecked, setIsExportVariablesChecked] = useState(true);
  const { getVariableData } = useEnvironmentManager();

  const handleExport = () => {
    const dataToExport = exportData;
    if (!isExportVariablesChecked) {
      dataToExport.variables = [];
    }
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RQ-${collections.length === 1 ? "collection" : "collections"}-${getFormattedDate("DD_MM_YYYY")}.json`;
    a.click();
  };

  const extractVariablesFromAPIRecord = useCallback(
    (api: RQAPI.ApiRecord) => {
      const variables = new Set<string>();
      const apiRequest = api.data.request;

      const checkAndAddVariable = (value: string) => {
        const variable = extractVariableNameFromStringIfExists(value);
        if (variable) variables.add(variable);
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

      return Array.from(variables).map(getVariableData);
    },
    [getVariableData]
  );

  useEffect(() => {
    if (isOpen && !isCollectionsProcessed) {
      const extractedVariables: VariableExport[] = [];
      const processedCollections: (RQAPI.CollectionRecord | RQAPI.ApiRecord)[] = [];

      collections.forEach((collection) => {
        const collectionToExport = { ...collection, data: {} };
        processedCollections.push(collectionToExport);

        collection.data.children.forEach((api) => {
          processedCollections.push(api);
          extractedVariables.push(...extractVariablesFromAPIRecord(api as RQAPI.ApiRecord));
        });
      });

      setExportData({ variables: extractedVariables, records: processedCollections });
      setIsCollectionsProcessed(true);
    }
  }, [isOpen, collections, extractVariablesFromAPIRecord, isCollectionsProcessed]);

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
            Export the variables used in the collection
          </div>
        )}
      </div>
    </Modal>
  );
};
