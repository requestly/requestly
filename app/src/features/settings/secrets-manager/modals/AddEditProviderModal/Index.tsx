import { Modal, Tooltip } from "antd";
import "./index.scss";
import { RQButton } from "lib/design-system-v2/components";
import NetworkPingIcon from "assets/icons/network-ping.svg?react";
import { InputField } from "../../components/InputField/InputField";
import { SelectField } from "../../components/SelectField/Index";
import { authMethodOptions, regionsList } from "../../consts/dropdownOptions";
import { InputPasswordField } from "../../components/InputField/InputPasswordField";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ProviderData } from "../../context/SecretsModalsContext";

interface AddEditProviderModalProps {
  mode: "add" | "edit";
  open: boolean;
  providerData?: ProviderData;
  onChange: (data: any) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  onTestConnection: () => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const errorSuffix = (error: string) => (
  <Tooltip title={error} placement="right" showArrow={false} overlayClassName="error-tooltip">
    <InfoCircleOutlined className="info-icon" />
  </Tooltip>
);

export const AddEditProviderModal = ({
  mode,
  open,
  providerData,
  onChange,
  onClose,
  onSave,
  onTestConnection,
  isLoading = false,
  error,
}: AddEditProviderModalProps) => {
  const header = <p className="add-edit-provider-modal-header">{mode === "add" ? "Add provider" : "Edit provider"}</p>;
  const footer = (
    <div className="add-edit-provider-modal-footer">
      <RQButton
        type="secondary"
        className="test-connection-button"
        onClick={onTestConnection}
        icon={<NetworkPingIcon />}
        loading={isLoading}
        disabled={isLoading}
      >
        Test connection
      </RQButton>
      <div className="footer-right-section">
        <RQButton type="secondary" className="cancel-button" onClick={onClose} disabled={isLoading}>
          Cancel
        </RQButton>
        <RQButton
          type="secondary"
          className="add-provider-button"
          onClick={onSave}
          loading={isLoading}
          disabled={isLoading}
        >
          {mode === "add" ? "Add provider" : "Save changes"}
        </RQButton>
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
      zIndex={1050}
      onCancel={onClose}
      footer={footer}
    >
      <div className="add-edit-provider-modal-content">
        <InputField
          label="Instance name"
          id="instance-name"
          value={providerData?.instanceName || ""}
          onValueChange={(value) => onChange({ instanceName: value })}
          status={error ? "error" : undefined}
          suffix={error ? errorSuffix(error) : undefined}
          disabled={isLoading}
        />
        <SelectField label="Secret manager" id="secret-manager" value="" options={[]} />
        <SelectField
          label="Auth method"
          options={authMethodOptions as any}
          id="auth-method"
          value=""
          handleFilterChange={() => {}}
        />
        <InputPasswordField
          label="Access key"
          id="access-key"
          value={providerData?.accessKey || ""}
          onValueChange={(value) => onChange({ accessKey: value })}
          disabled={isLoading}
        />
        <InputPasswordField
          label="Secret key"
          id="secret-key"
          value={providerData?.secretKey || ""}
          onValueChange={(value) => onChange({ secretKey: value })}
          disabled={isLoading}
        />
        <InputPasswordField
          label="Session token"
          id="session-token"
          value={providerData?.sessionToken || ""}
          onValueChange={(value) => onChange({ sessionToken: value })}
          disabled={isLoading}
        />
        <SelectField label="Region" options={regionsList as any} id="region" value="" handleFilterChange={() => {}} />
      </div>
    </Modal>
  );
};
