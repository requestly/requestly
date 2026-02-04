import React from "react";
import { Alert, Radio } from "antd";
import { ExportResult } from "../modals/CommonApiClientExportModal";
import "./commonApiClientExporter.scss";

export interface CommonApiClientExporterProps {
  title: string;
  exportResult: ExportResult;
  exportError: string | null;
  selectedFileIndex?: number;
  onFileSelect?: (index: number) => void;
}

export const CommonApiClientExporter: React.FC<CommonApiClientExporterProps> = ({
  title,
  exportResult,
  exportError,
  selectedFileIndex = 0,
  onFileSelect,
}) => {
  const hasMultipleFiles = exportResult?.file && exportResult.file.length > 1;
  const fileName = hasMultipleFiles
    ? exportResult.file[selectedFileIndex]?.fileName
    : exportResult?.file?.[0]?.fileName;

  return (
    <div className="common-api-client-exporter-content">
      {exportError && <Alert description={exportError} type="error" showIcon />}

      {exportResult && (
        <>
          <div className="export-details-card">
            <div className="export-name">{fileName}</div>
            <div className="export-details">
              {exportResult?.metadata && exportResult.metadata.length > 0 ? (
                exportResult.metadata.map((meta, index) => (
                  <div key={index} className="export-details-item">
                    <span className="export-details-item-label">{meta.key}: </span>
                    <span className="export-details-item-value">
                      {Array.isArray(meta.value) ? meta.value.join(", ") : meta.value}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="export-details-item">
                    <span className="export-details-item-label">Format: </span>
                    <span className="export-details-item-value">{title}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {hasMultipleFiles && onFileSelect && (
            <div className="export-format-selector">
              <div className="export-format-label">Export as:</div>
              <Radio.Group value={selectedFileIndex} onChange={(e) => onFileSelect(e.target.value)}>
                {exportResult.file.map((file, index) => (
                  <Radio key={index} value={index}>
                    {file.type}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          )}
        </>
      )}
    </div>
  );
};
