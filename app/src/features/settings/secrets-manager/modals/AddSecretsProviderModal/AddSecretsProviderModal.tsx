import { useEffect, useRef } from "react";
import { Modal, Tooltip } from "antd";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import NetworkPingIcon from "assets/icons/network-ping.svg?react";
import { InputField } from "../../components/InputField/InputField";
import { SelectField } from "../../components/SelectField/Index";
import { AutoCompleteField } from "../../components/AutoCompleteField/Index";
import { authMethodOptions, regionsList, secretManagerOptions } from "../../consts/dropdownOptions";
import { InputPasswordField } from "../../components/InputField/InputPasswordField";
import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { ProviderData } from "../../context/SecretsModalsContext";
import { SecretProviderType } from "@requestly/shared/types/entities/secretsManager";
import "./addSecretsModal.scss";

interface AddSecretsProviderModalProps {
  mode: "add" | "edit";
  open: boolean;
  providerData: ProviderData;
  onChange: (data: Partial<ProviderData>) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  onTestConnection: () => void | Promise<void>;
  onResetConnectionStatus?: () => void;
  isFetchingConfig?: boolean;
  isTestingConnection?: boolean;
  isSavingProvider?: boolean;
  connectionStatus?: "untested" | "testing" | "success" | "failed";
  error?: string;
}

const optionalTitle = (label: string) => (
  <span className="element-label">
    {label} <span className="optional-label">(optional)</span>
  </span>
);

const errorSuffix = (error: string) => (
  <Tooltip title={error} placement="right" showArrow={false} overlayClassName="error-tooltip">
    <InfoCircleOutlined className="info-icon" />
  </Tooltip>
);

export const AddSecretsProviderModal = ({
  mode,
  open,
  providerData,
  onChange,
  onClose,
  onSave,
  onTestConnection,
  onResetConnectionStatus,
  isFetchingConfig = false,
  isTestingConnection = false,
  isSavingProvider = false,
  connectionStatus = "untested",
  error,
}: AddSecretsProviderModalProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-reset connection status after 5 seconds of success or failure
  useEffect(() => {
    if (connectionStatus === "success" || connectionStatus === "failed") {
      timeoutRef.current = setTimeout(() => {
        onResetConnectionStatus?.();
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [connectionStatus, onResetConnectionStatus]);

  const isFormValid = Boolean(
    providerData.instanceName.trim() &&
      providerData.accessKey.trim() &&
      providerData.secretKey.trim() &&
      providerData.region
  );

  const isBusy = isTestingConnection || isSavingProvider;
  const isTestConnectionDisabled = !isFormValid || isBusy;

  const isTestConnectionTooltipDisabled = isTestConnectionDisabled && connectionStatus === "untested";
  const isSavingProviderDisabled = isTestConnectionDisabled || isSavingProvider;

  const header = <p className="add-edit-provider-modal-header">{mode === "add" ? "Add provider" : "Edit provider"}</p>;
  const footer = (
    <div className="add-edit-provider-modal-footer">
      {connectionStatus === "success" || connectionStatus === "failed" ? (
        <div className={`connection-status ${connectionStatus === "success" ? "success" : "failed"}`}>
          {connectionStatus === "success" ? (
            <span className="status-text">
              <CheckOutlined className="green-tick-icon" /> Connection successful
            </span>
          ) : (
            <span className="status-text">
              <CloseOutlined className="red-cross-icon" /> Connection failed
            </span>
          )}
        </div>
      ) : (
        <RQTooltip
          title={isTestConnectionTooltipDisabled ? "Fill all required fields to test connection" : ""}
          showArrow={false}
          placement="topRight"
          destroyTooltipOnHide
          mouseLeaveDelay={0}
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
        >
          <span>
            <RQButton
              type="transparent"
              className="test-connection-button"
              onClick={onTestConnection}
              icon={connectionStatus === "untested" ? <NetworkPingIcon /> : undefined}
              loading={isTestingConnection}
              disabled={isTestConnectionDisabled}
            >
              {connectionStatus === "testing" ? "Testing connection" : "Test connection"}
            </RQButton>
          </span>
        </RQTooltip>
      )}
      <div className="footer-right-section">
        <RQButton type="secondary" className="cancel-button" onClick={onClose} disabled={isBusy}>
          Cancel
        </RQButton>
        <RQTooltip
          title={isSavingProviderDisabled ? "Fill all required fields to add provider" : null}
          showArrow={false}
          placement="topLeft"
          destroyTooltipOnHide
          mouseLeaveDelay={0}
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
        >
          <span>
            <RQButton
              type="secondary"
              className="add-provider-button"
              onClick={onSave}
              loading={isSavingProvider}
              disabled={isSavingProviderDisabled}
            >
              {mode === "add" ? "Add provider" : "Save changes"}
            </RQButton>
          </span>
        </RQTooltip>
      </div>
    </div>
  );

  return (
    <Modal
      title={header}
      width={480}
      open={open}
      maskClosable={false}
      destroyOnClose={true}
      className="add-edit-provider-modal"
      wrapClassName="add-edit-provider-modal-wrap"
      onCancel={onClose}
      footer={footer}
    >
      <div className="add-edit-provider-modal-content">
        <InputField
          label="Instance name"
          id="instance-name"
          value={providerData.instanceName}
          onValueChange={(value) => onChange({ instanceName: value })}
          status={error ? "error" : undefined}
          suffix={error ? errorSuffix(error) : undefined}
          disabled={isFetchingConfig || isSavingProvider}
        />
        <SelectField
          label="Secret manager"
          id="secret-manager"
          value={providerData.secretManagerType}
          options={secretManagerOptions}
          handleFilterChange={(value: string) => onChange({ secretManagerType: value as SecretProviderType })}
          disabled={isFetchingConfig || isSavingProvider}
        />
        <SelectField
          label="Auth method"
          options={authMethodOptions}
          id="auth-method"
          value={providerData.authMethod}
          handleFilterChange={(value: "manual" | "aws") => onChange({ authMethod: value })}
          disabled={isFetchingConfig || isSavingProvider}
        />
        <InputPasswordField
          label="Access key"
          id="access-key"
          value={providerData.accessKey}
          onValueChange={(value) => onChange({ accessKey: value })}
          disabled={isFetchingConfig || isSavingProvider}
        />
        <InputPasswordField
          label="Secret key"
          id="secret-key"
          value={providerData.secretKey}
          onValueChange={(value) => onChange({ secretKey: value })}
          disabled={isFetchingConfig || isSavingProvider}
        />
        <InputPasswordField
          label={optionalTitle("Session token")}
          id="session-token"
          value={providerData.sessionToken || ""}
          onValueChange={(value) => onChange({ sessionToken: value })}
          disabled={isFetchingConfig || isSavingProvider}
        />
        <AutoCompleteField
          label="Region"
          options={regionsList}
          id="region"
          value={providerData.region}
          handleFilterChange={(value: string) => onChange({ region: value })}
          disabled={isFetchingConfig || isSavingProvider}
          placeholder="Select region"
        />
      </div>
    </Modal>
  );
};
