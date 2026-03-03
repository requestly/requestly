import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import NoProvidersEmptyState from "./NoProviderEmptyState";
import ProviderDetails from "./ProviderDetails";
import { Secret, ProviderInstance } from "./ProviderDetails/types";
import SecretKeysModal from "./modals/SecretKeysModal/Index";
import { selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import { useSelector } from "react-redux";

const INSTANCES: ProviderInstance[] = [
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];

const MOCK_SECRETS: Secret[] = [
  {
    id: "1",
    alias: "DB_PASSWORDDB_PASSWORDDB_PASSWORDDB_PASSWORD",
    arnSecretName: "arn:aws:secretsmanager:us-west-2:123456789012:secret:mysecret-a1b2",
    versionId: "3sf3re-8er5-4er6-wer7-wereryy38",
    secretValue: "sk_test_supersecretpasswordsk_test_supersecretpassword",
    isVisible: false,
    tags: [],
  },
  {
    id: "2",
    alias: "STRIPE_API_KEY",
    arnSecretName: "arn:aws:secretsmanager:us-east-1:123456789",
    versionId: "",
    secretValue: "sk_live_1234567890",
    isVisible: false,
    tags: ["api_key", "web_sec"],
    keyValues: [
      { key: "api_key", value: "sk_live_1234567890abcdef" },
      { key: "web_sec", value: "whsec_abcdefghijklmnop" },
    ],
  },
];

const Secrets = () => {
  const providers = useSelector(selectAllSecretProviders);

  const [selectedInstance, setSelectedInstance] = useState("staging");
  const [secrets, setSecrets] = useState<Secret[]>(MOCK_SECRETS);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>("few seconds ago");
  const [keyValuesModal, setKeyValuesModal] = useState<{ open: boolean; secretId: string | null }>({
    open: false,
    secretId: null,
  });

  const activeSecret = secrets.find((s) => s.id === keyValuesModal.secretId);

  const handleFetchSecrets = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
      setLastFetched("just now");
    }, 1000);
  };

  const handleAddSecret = (data: { alias: string; arnSecretName: string; versionId: string }) => {
    const newSecret: Secret = {
      id: uuidv4(),
      alias: data.alias,
      arnSecretName: data.arnSecretName,
      versionId: data.versionId,
      secretValue: "",
      isVisible: false,
      tags: [],
    };
    setSecrets((prev) => [...prev, newSecret]);
  };

  const handleEditSecret = (secretId: string, data: { alias: string; arnSecretName: string; versionId: string }) => {
    setSecrets((prev) =>
      prev.map((s) =>
        s.id === secretId
          ? { ...s, alias: data.alias, arnSecretName: data.arnSecretName, versionId: data.versionId }
          : s
      )
    );
  };

  const handleDeleteSecret = (secretId: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== secretId));
  };

  const handleToggleVisibility = (secretId: string) => {
    setSecrets((prev) => prev.map((s) => (s.id === secretId ? { ...s, isVisible: !s.isVisible } : s)));
  };

  const handleViewKeyValues = (secretId: string) => {
    setKeyValuesModal({ open: true, secretId });
  };

  return (
    <>
      {!providers.length === 0 ? (
        <NoProvidersEmptyState />
      ) : (
        <ProviderDetails
          instances={INSTANCES}
          selectedInstance={selectedInstance}
          onInstanceChange={setSelectedInstance}
          isActiveInstance
          secrets={secrets}
          lastFetched={lastFetched}
          isFetching={isFetching}
          onFetchSecrets={handleFetchSecrets}
          onAddSecret={handleAddSecret}
          onEditSecret={handleEditSecret}
          onDeleteSecret={handleDeleteSecret}
          onToggleVisibility={handleToggleVisibility}
          onViewKeyValues={handleViewKeyValues}
        />
      )}

      <SecretKeysModal
        open={keyValuesModal.open}
        alias={activeSecret?.alias ?? ""}
        keyValues={activeSecret?.keyValues ?? []}
        onClose={() => setKeyValuesModal({ open: false, secretId: null })}
      />
    </>
  );
};

export default Secrets;
