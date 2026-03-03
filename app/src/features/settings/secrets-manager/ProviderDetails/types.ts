export interface Secret {
  id: string;
  alias: string;
  arnSecretName: string;
  versionId: string;
  secretValue: string;
  isVisible?: boolean;
  tags?: string[];
  keyValues?: { key: string; value: string }[];
}

export interface ProviderInstance {
  value: string;
  label: string;
}

export interface SecretsTableProps {
  secrets: Secret[];
  onToggleVisibility: (secretId: string) => void;
  onEditSecret: (secretId: string, data: { alias: string; arnSecretName: string; versionId: string }) => void;
  onDeleteSecret: (secretId: string) => void;
  onAddSecret: (data: { alias: string; arnSecretName: string; versionId: string }) => void;
  onViewKeyValues: (secretId: string) => void;
}

export interface ProviderDetailsProps {
  /** List of available instances to show in the dropdown */
  instances: ProviderInstance[];
  /** Currently selected instance value */
  selectedInstance: string;
  /** Called when the user picks a different instance */
  onInstanceChange: (instance: string) => void;
  /** Whether the selected instance is the active/connected one */
  isActiveInstance?: boolean;
  /** Secrets to display in the table */
  secrets: Secret[];
  /** Human-readable last-fetched timestamp, e.g. "few seconds ago" */
  lastFetched?: string;
  /** Whether a fetch is in progress */
  isFetching?: boolean;
  /** Called when the user clicks "Fetch secrets" */
  onFetchSecrets: () => void;
  /** Called when the user clicks "+ Add" */
  onAddSecret: (data: { alias: string; arnSecretName: string; versionId: string }) => void;
  /** Called when the user saves an inline edit on a row */
  onEditSecret: (secretId: string, data: { alias: string; arnSecretName: string; versionId: string }) => void;
  /** Called when the user clicks Delete on a row */
  onDeleteSecret: (secretId: string) => void;
  /** Called when the user toggles secret visibility */
  onToggleVisibility: (secretId: string) => void;
  /** Called when the user clicks on key/value tags to view them */
  onViewKeyValues: (secretId: string) => void;
}
