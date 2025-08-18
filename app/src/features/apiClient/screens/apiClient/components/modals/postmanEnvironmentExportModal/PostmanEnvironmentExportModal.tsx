import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { getFormattedDate } from "utils/DateTimeUtils";
import { toast } from "utils/Toast";
import "./postmanEnvironmentExportModal.scss";
import fileDownload from "js-file-download";
import { EnvironmentData } from "backend/environment/types";
import { isGlobalEnvironment } from "../../../../environment/utils";
import { trackEnvironmentExported } from "modules/analytics/events/features/apiClient";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { postmanEnvironmentExporter } from "@requestly/alternative-importers";

interface PostmanEnvironmentExportModalProps {
  environments: EnvironmentData[];
  isOpen: boolean;
  onClose: () => void;
}

interface RequestlyEnvironmentExportData {
  schema_version: string;
  environments: EnvironmentData[];
}

const ENVIRONMENTS_SCHEMA_VERSION = "1.0.0";

export const PostmanEnvironmentExportModal: React.FC<PostmanEnvironmentExportModalProps> = ({
  environments,
  isOpen,
  onClose,
}) => {
  const [isEnvironmentsProcessed, setIsEnvironmentsProcessed] = useState(false);
  const [exportData, setExportData] = useState<RequestlyEnvironmentExportData>({
    schema_version: ENVIRONMENTS_SCHEMA_VERSION,
    environments: [],
  });

  const fileInfo = {
    label: environments.length > 1 ? "Environments" : "Environment",
    type: "ENV",
  };

  const handleExport = useCallback(() => {
    try {
      // Convert Requestly environments to Postman format
      const postmanEnvironments = postmanEnvironmentExporter(exportData);

      if (postmanEnvironments.length === 1) {
        // Single environment export
        const postmanEnv = postmanEnvironments[0];
        const fileContent = JSON.stringify(postmanEnv, null, 2);
        const fileName = `Postman-${postmanEnv.name}-environment-${getFormattedDate("DD_MM_YYYY")}.json`;
        fileDownload(fileContent, fileName, "application/json");
      } else {
        // Multiple environments export - create a zip or export individually
        postmanEnvironments.forEach((postmanEnv: any) => {
          const fileContent = JSON.stringify(postmanEnv, null, 2);
          const fileName = `Postman-${postmanEnv.name}-environment-${getFormattedDate("DD_MM_YYYY")}.json`;
          fileDownload(fileContent, fileName, "application/json");
        });
      }

      trackEnvironmentExported();
      onClose();
    } catch (error) {
      toast.error("Failed to export environments. Please try again.");
    }
  }, [exportData, onClose]);

  const processEnvironments = useCallback((environments: EnvironmentData[]): EnvironmentData[] => {
    return environments.map((env) => {
      const updatedVariables = Object.keys(env.variables).reduce((acc, key) => {
        const { localValue, ...rest } = env.variables[key];
        acc[key] = rest;
        return acc;
      }, {} as typeof env.variables);

      return {
        ...env,
        variables: updatedVariables,
        isGlobal: isGlobalEnvironment(env.id),
      };
    });
  }, []);

  useEffect(() => {
    if (!isOpen || isEnvironmentsProcessed) return;

    const processedEnvironments = processEnvironments(environments);
    setExportData({
      schema_version: ENVIRONMENTS_SCHEMA_VERSION,
      environments: processedEnvironments,
    });
    setIsEnvironmentsProcessed(true);
  }, [isOpen, environments, isEnvironmentsProcessed, processEnvironments]);

  return (
    <Modal
      title={
        <div className="postman-environment-export-modal-title">
          <MdOutlineIosShare />
          Export as Postman (v2.1 format)
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      className="custom-rq-modal postman-environment-export-modal"
      onOk={handleExport}
      okText="Export"
    >
      <div className="postman-environment-export-modal-content">
        <div className="export-details-card">
          <div className="export-name">
            Postman-{fileInfo.label}-{getFormattedDate("DD_MM_YYYY")}
          </div>
          <div className="export-details">
            <div className="export-details-item">
              <span className="export-details-item-label">{fileInfo.label}: </span>
              <span className="export-details-item-value">{environments?.length}</span>
            </div>
            <div className="export-details-item">
              <span className="export-details-item-label">Format: </span>
              <span className="export-details-item-value">Postman Environment</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
