import React from "react";
import LINKS from "config/constants/sub/links";
import PATHS from "config/constants/sub/paths";
import { selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import { PRICING } from "features/pricing";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import "./emptyStates.scss";
import { SecretsFooter } from "./SecretsFooter";

interface SecretsEmptyStateProps {
  onClose?: () => void;
}

const AutoCompleteSecretEmptyState: React.FC<SecretsEmptyStateProps> = ({ onClose }) => {
  const providers = useSelector(selectAllSecretProviders);
  const user = useSelector(getUserAuthDetails);
  const isUserProfessional = [
    PRICING.PLAN_NAMES.PROFESSIONAL,
    PRICING.PLAN_NAMES.ENTERPRISE,
    PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE,
    PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE,
    PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL,
  ].includes(user?.details?.planDetails?.planName || "");
  const navigate = useNavigate();

  const handleAddProvider = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(PATHS.SETTINGS.SECRETS.ABSOLUTE);
    onClose?.();
  };

  const handleUpgradePlan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(PATHS.PRICING.ABSOLUTE);
    onClose?.();
  };

  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(LINKS.REQUESTLY_SECRETS_DOCS, "_blank", "noopener,noreferrer");
  };

  if (!isUserProfessional) {
    return (
      <div className="secrets-autocomplete-footer">
        <div className="secrets-no-provider-message">
          <span className="no-provider-text">
            Upgrade plan to add providers and use secrets.{" "}
            <span className="learn-more" onMouseDown={handleLearnMore}>
              Learn more
            </span>
          </span>
        </div>
        <div className="secrets-upgrade-button" onMouseDown={handleUpgradePlan}>
          <span>Upgrade plan</span>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="secrets-autocomplete-footer">
        <div className="secrets-no-provider-message">
          <span className="no-provider-text">
            No provider added yet.{" "}
            <span className="learn-more" onMouseDown={handleLearnMore}>
              Learn more
            </span>
          </span>
        </div>
        <div className="secrets-add-provider-button" onMouseDown={handleAddProvider}>
          <span>Add provider</span>
        </div>
      </div>
    );
  }

  return <SecretsFooter showAddAlias={true} />;
};

export default AutoCompleteSecretEmptyState;
