import React from "react";
import { Select } from "antd";
import { AiOutlineCheckCircle } from "@react-icons/all-files/ai/AiOutlineCheckCircle";
import SecretsTable from "../components/SecretsTable/SecretsTable";
import { ProviderDetailsProps } from "./types";
import "./providerDetails.scss";
import { RQButton } from "lib/design-system-v2/components";

const { Option } = Select;

const ProviderDetails: React.FC<ProviderDetailsProps> = ({
  instances,
  selectedInstance,
  onInstanceChange,
  isActiveInstance = false,
  secrets,
  lastFetched,
  isFetching = false,
  onFetchSecrets,
  onAddSecret,
  onEditSecret,
  onDeleteSecret,
  onToggleVisibility,
  onViewKeyValues,
}) => {
  return (
    <div className="provider-details-container">
      <div className="provider-panel-header">
        <div className="header-left">
          <Select
            value={selectedInstance}
            onChange={onInstanceChange}
            className="instance-select"
            size="small"
            dropdownMatchSelectWidth={false}
          >
            {instances.map((inst) => (
              <Option key={inst.value} value={inst.value}>
                {inst.label}
              </Option>
            ))}
          </Select>

          {isActiveInstance && (
            <span className="active-instance-badge">
              <AiOutlineCheckCircle className="active-icon" />
              Active instance
            </span>
          )}
        </div>

        <div className="header-right">
          {lastFetched && <span className="last-fetched">Last fetched: {lastFetched}</span>}
          <RQButton type="primary" loading={isFetching} onClick={onFetchSecrets} className="fetch-secrets-btn">
            Fetch secrets
          </RQButton>
        </div>
      </div>

      <SecretsTable
        secrets={secrets}
        onToggleVisibility={onToggleVisibility}
        onEditSecret={onEditSecret}
        onDeleteSecret={onDeleteSecret}
        onAddSecret={onAddSecret}
        onViewKeyValues={onViewKeyValues}
      />

      <p className="usage-instructions">
        {`Use in requests: {{secret:ALIAS_NAME}}. For key/value secrets: {{secret:ALIAS_NAME.KEY_NAME}}.`}
      </p>
    </div>
  );
};

export default ProviderDetails;
