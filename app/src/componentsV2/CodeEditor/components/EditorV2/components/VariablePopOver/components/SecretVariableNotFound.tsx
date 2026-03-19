import PATHS from "config/constants/sub/paths";
import {
  selectAllSecretProviders,
  selectSelectedProviderId,
} from "features/apiClient/slices/secrets-manager/selectors";
import React from "react";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { useNavigate } from "react-router-dom";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

const SecretVariableNotFound: React.FC = () => {
  const navigate = useNavigate();
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const providers = useSelector(selectAllSecretProviders);
  const activeProvider = selectedProviderId ? providers.find((p) => p.id === selectedProviderId) : null;

  if (!isFeatureCompatible(FEATURES.SECRETS_MANAGER)) {
    return null;
  }

  const handleOpenSecrets = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(PATHS.SETTINGS.SECRETS.ABSOLUTE);
  };

  return (
    <div className="secrets-not-found-container">
      <div className="secrets-not-found-message">
        <span className="no-secret-text">Secret could not be resolved. Check the active instance or switch.</span>
      </div>
      {activeProvider && (
        <div className="secrets-active-instance">
          <span className="active-instance-label">
            Active instance:&nbsp;
            <span className="active-instance-name" onMouseDown={handleOpenSecrets}>
              {activeProvider.name}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default SecretVariableNotFound;
