import React, { useCallback, useMemo, useState } from "react";
import { Modal } from "antd";
import { CommonApiClientExporter } from "../../CommonApiClientExporter/CommonApiClientExporter";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { ExportType, ExporterFunction } from "features/apiClient/helpers/exporters/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  exporter: ExporterFunction;
  exporterType: ExportType;
}

export const CommonApiClientExportModal: React.FC<Props> = ({ isOpen, onClose, title, exporter, exporterType }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);

  // Convert data using useMemo - exporter handles its own Sentry tracking
  const { exportResult, exportError } = useMemo(() => {
    try {
      return { exportResult: exporter(), exportError: null };
    } catch (error) {
      return {
        exportResult: null,
        exportError: error.message || "Failed to convert data. Please try again.",
      };
    }
  }, [exporter]);

  const handleExport = useCallback(() => {
    if (!exportResult || !exportResult.files || exportResult.files.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Get the selected file
      const selectedFile = exportResult.files[selectedFileIndex];
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
      const errorMessage =
        error instanceof Error ? error.message : new Error("Failed to download file. Please try again.").message;
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
