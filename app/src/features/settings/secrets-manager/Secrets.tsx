import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import NoProvidersEmptyState from "./NoProviderEmptyState";
import ProviderDetails from "./ProviderDetails";
import SecretKeysModal from "./modals/SecretKeysModal/Index";
import {
  selectAllSecretProviders,
  selectSecretsForSelectedProvider,
  getSecretId,
} from "features/apiClient/slices/secrets-manager";
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
import { parseSecretKeyValues } from "./utils/parseSecretKeyValues";

const Secrets = () => {
  const providers = useSelector(selectAllSecretProviders);
  const secrets = useSelector(selectSecretsForSelectedProvider) as AwsSecretValue[];
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

  const activeSecret = secrets.find((s) => getSecretId(s) === keyValuesModal.secretId);
  const activeKeyValues = parseSecretKeyValues(activeSecret?.value);

  if (providers.length === 0) {
    return <NoProvidersEmptyState />;
  }

  return (
    <>
      <ProviderDetails onViewKeyValues={handleViewKeyValues} />

      <SecretKeysModal
        open={keyValuesModal.open}
        alias={activeSecret?.name ?? ""}
        keyValues={activeKeyValues ?? []}
        onClose={handleCloseKeyValues}
      />
    </>
  );
};

export default Secrets;
