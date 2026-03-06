import { SecretVariable } from "lib/secret-variables/types";
import { selectSelectedProviderId, selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { useSelector } from "react-redux";
import CheckCircleOutlined from "@ant-design/icons/lib/icons/CheckCircleOutlined";
import { RQButton } from "lib/design-system-v2/components/RQButton/RQButton";
import FilterIcon from "assets/icons/filter-manage.svg?react";
import "./index.scss";

export const SecretsVariableInfo: React.FC<{
  variable: SecretVariable;
}> = ({ variable }) => {
  const navigate = useNavigate();
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const providers = useSelector(selectAllSecretProviders);
  const activeProvider = selectedProviderId ? providers.find((p) => p.id === selectedProviderId) : null;
  // Parse the variable name to extract alias and key
  // Format: secrets.{providerId}.{alias} or secrets.{providerId}.{alias}.{key}
  const nameParts = variable.name.split(".");
  const alias = nameParts[1] || "";
  const key = nameParts[2] || "";

  const handleManageClick = () => {
    console.log("Manage clicked");
    navigate(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS);
  };

  return (
    <div className="secrets-variable-info-container">
      <div className="secrets-variable-header">
        <div className="secrets-provider-info">
          <CheckCircleOutlined className="provider-check-icon" />
          <span className="provider-name">{activeProvider?.name || "Secret Provider"}</span>
        </div>
        <RQButton
          type="transparent"
          size="small"
          icon={<FilterIcon className="filter-icon" />}
          onMouseDown={handleManageClick}
          className="manage-button"
        >
          Manage
        </RQButton>
      </div>
      <div className="secrets-variable-content">
        <div className="secrets-info-row">
          <span className="secrets-info-label">Alias</span>
          <span className="secrets-info-value">{alias}</span>
        </div>
        <div className="secrets-info-row">
          <span className="secrets-info-label">Key/value secret</span>
          <span className="secrets-info-value">{key}</span>
        </div>
      </div>
    </div>
  );
};
