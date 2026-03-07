import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { unstable_useBlocker, useNavigate } from "react-router-dom";
import NoProvidersEmptyState from "./ProviderEmptyScreen";
import ProviderDetails from "./ProviderDetails";
import SecretKeysModal from "./modals/SecretKeysModal/Index";
import {
  selectAllSecretProviders,
  selectSecretsForSelectedProvider,
  selectIsDirtyForSelectedProvider,
} from "features/apiClient/slices/secrets-manager";
import { revertDirtyChanges } from "features/apiClient/slices/secrets-manager/thunks";
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
import { parseSecretKeyValues } from "./utils/parseSecretKeyValues";
import { AppDispatch } from "store/types";
import { useSecretsModals } from "./context/SecretsModalsContext";
import { isDesktopMode } from "utils/AppUtils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import PATHS from "config/constants/sub/paths";
import { PRICING } from "features/pricing";

const Secrets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const providers = useSelector(selectAllSecretProviders);
  const secrets = useSelector(selectSecretsForSelectedProvider) as AwsSecretValue[];
  const isDirty = useSelector(selectIsDirtyForSelectedProvider);
  const [keyValuesModal, setKeyValuesModal] = useState<{ open: boolean; secretId: string | null }>({
    open: false,
    secretId: null,
  });

  const user = useSelector(getUserAuthDetails);
  const isUserProfessional = [
    PRICING.PLAN_NAMES.PROFESSIONAL,
    PRICING.PLAN_NAMES.ENTERPRISE,
    PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE,
    PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE,
    PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL,
  ].includes(user?.details?.planDetails?.planName || "");

  const handleViewKeyValues = useCallback((secretId: string) => {
    setKeyValuesModal({ open: true, secretId });
  }, []);

  const handleCloseKeyValues = useCallback(() => {
    setKeyValuesModal({ open: false, secretId: null });
  }, []);

  const blocker = unstable_useBlocker(useCallback(() => isDirty, [isDirty]));

  useEffect(() => {
    if (blocker.state === "blocked") {
      const shouldDiscard = window.confirm("You have unfetched secrets. Discard changes?");
      if (shouldDiscard) {
        dispatch(revertDirtyChanges()).then(() => blocker.proceed());
      } else {
        blocker.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker.state]);

  const activeSecret = secrets.find((s) => s.secretReference.id === keyValuesModal.secretId);
  const activeKeyValues = parseSecretKeyValues(activeSecret?.value);

  const { openAddProviderModal } = useSecretsModals();

  const handleDownloadRequestly = () => {
    window.open("https://requestly.com/downloads/desktop/", "_blank", "noopener,noreferrer");
  };

  const handleUpgradePlan = (e: React.MouseEvent) => {
    navigate(PATHS.PRICING.ABSOLUTE);
  };

  if (!isDesktopMode()) {
    return (
      <NoProvidersEmptyState
        title="Available on Desktop"
        description="Secrets feature is exclusive to the Requestly desktop app. Download the app to manage your secrets securely."
        ctaText="Download Requestly"
        onCtaClick={handleDownloadRequestly}
        icon={
          <img
            src="/assets/media/apiClient/download-desktop.svg"
            alt="Not supported in web version"
            style={{
              width: "48px",
              height: "48px",
            }}
          />
        }
      />
    );
  }

  if (!isUserProfessional) {
    return (
      <NoProvidersEmptyState
        title="Upgrade plan to use secrets"
        description="Add providers and fetch secrets with the Professional plan. Secrets are never synced to Requestly Cloud. "
        ctaText="Upgrade plan"
        onCtaClick={handleUpgradePlan}
      />
    );
  }

  if (providers.length === 0) {
    return (
      <NoProvidersEmptyState
        title="No providers connected yet"
        description="Add provider to securely fetch your secrets and use them in API requests. Secrets are never synced to
          Requestly Cloud."
        ctaText="Add provider"
        onCtaClick={openAddProviderModal}
      />
    );
  }

  return (
    <>
      <ProviderDetails onViewKeyValues={handleViewKeyValues} />

      <SecretKeysModal
        open={keyValuesModal.open}
        alias={activeSecret?.secretReference?.alias ?? activeSecret?.name ?? ""}
        keyValues={activeKeyValues ?? []}
        onClose={handleCloseKeyValues}
      />
    </>
  );
};

export default Secrets;
