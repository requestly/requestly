import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, ExportOutlined } from "@ant-design/icons";
import { selectSelectedProviderId, selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import PATHS from "config/constants/sub/paths";
import "./emptyStates.scss";

interface SecretsFooterProps {
  onClose?: () => void;
  showAddAlias?: boolean;
}

export const SecretsFooter: React.FC<SecretsFooterProps> = ({ onClose, showAddAlias = false }) => {
  const navigate = useNavigate();
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const providers = useSelector(selectAllSecretProviders);
  const activeProvider = selectedProviderId ? providers.find((p) => p.id === selectedProviderId) : null;

  const handleAddAlias = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(PATHS.SETTINGS.SECRETS.ABSOLUTE);
    onClose?.();
  };

  const handleOpenSecrets = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(PATHS.SETTINGS.SECRETS.ABSOLUTE);
    onClose?.();
  };

  return (
    <div className="secrets-autocomplete-footer">
      {showAddAlias && (
        <div className="secrets-no-alias-message">
          <span className="no-alias-text">No aliases configured</span>
        </div>
      )}
      <div className="border-line" />
      <div className="secrets-add-alias-row" onMouseDown={handleAddAlias}>
        <PlusOutlined className="add-alias-icon" />
        <span>Add alias</span>
      </div>
      {activeProvider && (
        <div className="secrets-active-instance">
          <span className="active-instance-label">
            Active instance:&nbsp;
            <span className="active-instance-name" onMouseDown={handleOpenSecrets}>
              {activeProvider.name}
            </span>
          </span>
          <ExportOutlined className="active-instance-link-icon" />
        </div>
      )}
    </div>
  );
};
