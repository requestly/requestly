import React from "react";
import { SecretVariable } from "lib/secret-variables/types";
import { selectSelectedProviderId, selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { useSelector } from "react-redux";
import CheckCircleOutlined from "@ant-design/icons/lib/icons/CheckCircleOutlined";
import { RQButton } from "lib/design-system-v2/components/RQButton/RQButton";
import { LuSlidersHorizontal } from "@react-icons/all-files/lu/LuSlidersHorizontal";
import "./index.scss";
import { RevealableSecretField } from "componentsV2/RevealableSecretField/RevealableSecretField";

export const SecretsVariableInfo: React.FC<{
  variable: SecretVariable;
}> = ({ variable }) => {
  const navigate = useNavigate();
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const providers = useSelector(selectAllSecretProviders);
  const activeProvider = selectedProviderId ? providers.find((p) => p.id === selectedProviderId) : null;
  // Parse the variable name to extract alias and key
  // Format: secrets:{alias} or secrets:{alias}.{key}
  const withoutPrefix = variable.name.slice("secrets:".length); // "alias.key"
  const dotIndex = withoutPrefix.indexOf(".");
  const alias = dotIndex >= 0 ? withoutPrefix.slice(0, dotIndex) : withoutPrefix; // "alias"
  const value = variable.value;

  const handleManageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(PATHS.SETTINGS.SECRETS.RELATIVE, { state: { redirectUrl: window.location.pathname } });
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
          icon={<LuSlidersHorizontal className="filter-icon" />}
          onClick={handleManageClick}
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
          <span className="secrets-info-label">Value</span>
          <span className="secrets-info-value">
            <RevealableSecretField value={value} isRevealable={true} />
          </span>
        </div>
      </div>
    </div>
  );
};
