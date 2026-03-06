import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { unstable_useBlocker } from "react-router-dom";
import NoProvidersEmptyState from "./NoProviderEmptyState";
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

const Secrets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const providers = useSelector(selectAllSecretProviders);
  const secrets = useSelector(selectSecretsForSelectedProvider) as AwsSecretValue[];
  const isDirty = useSelector(selectIsDirtyForSelectedProvider);
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
