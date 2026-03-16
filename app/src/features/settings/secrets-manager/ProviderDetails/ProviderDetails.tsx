import React, { useCallback, useMemo } from "react";
import { Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineCheckCircle } from "@react-icons/all-files/ai/AiOutlineCheckCircle";
import SecretsTable from "../components/SecretsTable/SecretsTable";
import "./providerDetails.scss";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import {
  selectAllSecretProviders,
  selectSelectedProviderId,
  selectLastFetchedForSelectedProvider,
  selectFetchStatus,
  selectIsDirtyForSelectedProvider,
  secretsManagerActions,
  fetchAndSaveSecretsForProvider,
  listSecrets,
} from "features/apiClient/slices/secrets-manager";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return "few seconds ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface ProviderDetailsProps {
  onViewKeyValues?: (secretId: string) => void;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ onViewKeyValues }) => {
  const dispatch = useDispatch();
  const providers = useSelector(selectAllSecretProviders);
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const lastFetchedTimestamp = useSelector(selectLastFetchedForSelectedProvider);
  const fetchStatus = useSelector(selectFetchStatus);
  const isDirty = useSelector(selectIsDirtyForSelectedProvider);

  const isFetching = fetchStatus === "loading";
  const lastFetched = useMemo(() => (lastFetchedTimestamp ? formatRelativeTime(lastFetchedTimestamp) : null), [
    lastFetchedTimestamp,
  ]);

  const handleInstanceChange = useCallback(
    (providerId: string) => {
      dispatch(secretsManagerActions.setSelectedProviderId(providerId));
      dispatch(listSecrets(providerId) as any);
    },
    [dispatch]
  );

  const handleFetchSecrets = useCallback(() => {
    if (selectedProviderId) {
      dispatch(fetchAndSaveSecretsForProvider({ providerId: selectedProviderId, triggeredBy: "user_action" }) as any);
    }
  }, [dispatch, selectedProviderId]);

  return (
    <div className="provider-details-container">
      <div className="provider-panel-header">
        <div className="header-left">
          <Select
            value={selectedProviderId ?? undefined}
            onChange={handleInstanceChange}
            className="instance-select"
            size="small"
            dropdownMatchSelectWidth={false}
            popupClassName="instance-select-dropdown"
            menuItemSelectedIcon={<CheckCircleOutlined className="check-circle-icon" />}
          >
            {providers.map((provider) => (
              <Option key={provider.id} value={provider.id}>
                {provider.name}
              </Option>
            ))}
          </Select>

          {selectedProviderId && (
            <RQTooltip
              title="Secrets used in requests will be resolved from this provider"
              showArrow={false}
              placement="topLeft"
            >
              <span className="active-instance-badge">
                <AiOutlineCheckCircle className="active-icon" />
                Active instance
              </span>
            </RQTooltip>
          )}
        </div>

        <div className="header-right">
          {isDirty ? (
            <span className="last-fetched">Changes not fetched</span>
          ) : (
            lastFetched && <span className="last-fetched">Last fetched: {lastFetched}</span>
          )}
          <RQTooltip
            title={!isDirty ? "Enter Alias and ARN/Secret name to fetch" : null}
            showArrow={false}
            placement="topLeft"
            destroyTooltipOnHide
            mouseLeaveDelay={0}
            getPopupContainer={(trigger) => trigger.parentElement || document.body}
          >
            <span>
              <RQButton
                type="primary"
                loading={isFetching}
                onClick={handleFetchSecrets}
                className="fetch-secrets-btn"
                disabled={!isDirty}
              >
                {isDirty && !isFetching && <span className="unsaved-dot" />}
                {!isFetching && "Fetch secrets"}
              </RQButton>
            </span>
          </RQTooltip>
        </div>
      </div>

      <SecretsTable onViewKeyValues={onViewKeyValues} />

      <p className="usage-instructions">
        {`Use in requests: {{secrets:ALIAS_NAME}}. For key/value secrets: {{secrets:ALIAS_NAME.KEY_NAME}}.`}
      </p>
    </div>
  );
};

export default ProviderDetails;
