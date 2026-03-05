import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { unstable_useBlocker } from "react-router-dom";
import NoProvidersEmptyState from "./NoProviderEmptyState";
import ProviderDetails from "./ProviderDetails";
import SecretKeysModal from "./modals/SecretKeysModal/Index";
import {
  selectAllSecretProviders,
  selectSecretsForSelectedProvider,
  selectHasPendingEntries,
  getSecretId,
} from "features/apiClient/slices/secrets-manager";
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
import { parseSecretKeyValues } from "./utils/parseSecretKeyValues";

const Secrets = () => {
  const providers = useSelector(selectAllSecretProviders);
  const secrets = useSelector(selectSecretsForSelectedProvider) as AwsSecretValue[];
  const hasPendingEntries = useSelector(selectHasPendingEntries);
  const [keyValuesModal, setKeyValuesModal] = useState<{ open: boolean; secretId: string | null }>({
    open: false,
    secretId: null,
  });

  const handleViewKeyValues = useCallback((secretId: string) => {
    setKeyValuesModal({ open: true, secretId });
  }, []);

  const handleCloseKeyValues = useCallback(() => {
    setKeyValuesModal({ open: false, secretId: null });
  }, []);

  unstable_useBlocker(() => {
    if (hasPendingEntries) {
      return !window.confirm("You have unfetched secrets. Discard changes?");
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingEntries) {
        e.preventDefault();
        e.returnValue = "You have unfetched secrets. Discard changes?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasPendingEntries]);

  const activeSecret = secrets.find((s) => getSecretId(s.secretReference) === keyValuesModal.secretId);
  const activeKeyValues = parseSecretKeyValues(activeSecret?.value);

  if (providers.length === 0) {
    return <NoProvidersEmptyState />;
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
