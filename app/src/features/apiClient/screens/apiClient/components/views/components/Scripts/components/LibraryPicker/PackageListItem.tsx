import React from "react";
import { RiBox3Line } from "@react-icons/all-files/ri/RiBox3Line";
import { FiArrowUpRight } from "@react-icons/all-files/fi/FiArrowUpRight";
import { Tooltip } from "antd";
import { ExternalPackage } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageTypes";

export interface PackageListItemProps {
  package: ExternalPackage;
  onClick: () => void;
  onDocsClick: (e: React.MouseEvent) => void;
}

export const PackageListItem: React.FC<PackageListItemProps> = ({ package: pkg, onClick, onDocsClick }) => {
  return (
    <div className="package-list-item" onClick={onClick}>
      <div className="package-list-item-content">
        <div className="package-list-item-icon-container">
          <RiBox3Line className="package-list-item-icon" />
        </div>
        <div className="package-list-item-info">
          <div className="package-list-item-header">
            <span className="package-list-item-name">{pkg.name}</span>
            {pkg.version && <span className="package-list-item-version">v{pkg.version}</span>}
          </div>
          {pkg.description && <span className="package-list-item-description">{pkg.description}</span>}
        </div>
      </div>
      {pkg.docsUrl && (
        <Tooltip title="View details" placement="top">
          <button className="package-list-item-action" onClick={onDocsClick}>
            <FiArrowUpRight className="package-list-item-action-icon" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
