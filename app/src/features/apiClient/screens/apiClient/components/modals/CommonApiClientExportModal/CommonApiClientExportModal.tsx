import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { CommonApiClientExporter } from "../../CommonApiClientExporter/CommonApiClientExporter";
import { toast } from "utils/Toast";
import { wrapWithCustomSpan } from "utils/sentry";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import * as Sentry from "@sentry/react";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";

export interface ExportResult {
  file: {
    fileName: string;
    content: Blob;
    type: string;
  }[];
  metadata: Array<{
    key: string;
    value: string[] | number | string;
  }>;
}

export type ExporterFunction = () => Promise<ExportResult>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  exporter: ExporterFunction;
  exporterType: string;
}

export const CommonApiClientExportModal: React.FC<Props> = ({ isOpen, onClose, title, exporter, exporterType }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);

  // Run exporter when modal opens to show preview
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setExportResult(null);
      setExportError(null);
      setSelectedFileIndex(0);
      return;
    }
    if (exportResult) {
      return;
    }

    const convertData = async () => {
      return wrapWithCustomSpan(
        {
          name: `[Transaction] api_client.${exporterType.toLowerCase()}_export.convert_data`,
          op: `api_client.${exporterType.toLowerCase()}_export.convert_data`,
          forceTransaction: true,
          attributes: {},
        },
        async () => {
          setIsLoading(true);
          setExportError(null);

          try {
            let result: ExportResult = await exporter();

            setExportResult(result);

            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_OK,
            });
          } catch (error) {
            const errorMessage = error.message || "Failed to convert data. Please try again.";
            setExportError(errorMessage);

            Sentry.captureException(error);
            Sentry.getActiveSpan()?.setStatus({
              code: SPAN_STATUS_ERROR,
            });
          } finally {
            setIsLoading(false);
          }
        }
      )();
    };

    convertData();
  }, [isOpen, exporterType, exportResult, exporter]);

  const handleExport = useCallback(async () => {
    if (!exportResult || !exportResult.file || exportResult.file.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Get the selected file
      const selectedFile = exportResult.file[selectedFileIndex];
      if (!selectedFile) {
        toast.error("Invalid file selection");
        return;
      }
      // Download the file
      const url = URL.createObjectURL(selectedFile.content);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedFile.fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${title}`);
      onClose();
    } catch (error) {
      const errorMessage = error.message || "Failed to download file. Please try again.";
      toast.error(errorMessage);
      Sentry.captureException(error);
    }
  }, [exportResult, selectedFileIndex, title, onClose]);

  return (
    <Modal
      destroyOnClose
      className="custom-rq-modal common-api-client-export-modal"
      title={
        <div className="export-modal-title">
          <MdOutlineIosShare />
          Export as {title}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleExport}
      okText="Export"
      confirmLoading={isLoading}
      okButtonProps={{ disabled: !exportResult || !!exportError }}
      width={600}
    >
      {exportResult && (
        <CommonApiClientExporter
          title={title}
          exportResult={exportResult}
          exportError={exportError}
          selectedFileIndex={selectedFileIndex}
          onFileSelect={setSelectedFileIndex}
        />
      )}
    </Modal>
  );
};
