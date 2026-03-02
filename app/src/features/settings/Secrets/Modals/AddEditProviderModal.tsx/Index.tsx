import { Modal, Tooltip } from "antd";
import "./index.scss";
import { RQButton } from "lib/design-system-v2/components";
import NetworkPingIcon from "assets/icons/network-ping.svg?react";
import { InputField } from "../../Components/InputField/InputField";
import { SelectField } from "../../Components/SelectField/Index";
import { authMethodOptions, regionsList } from "../../Consts/dropdownOptions";
import { InputPasswordField } from "../../Components/InputField/InputPasswordField";
import { InfoCircleOutlined } from "@ant-design/icons";

interface AddEditProviderModalProps {
  mode: "add" | "edit";
  open: boolean;
  providerData?: any; // Replace with actual type of provider data
  onChange: (data: any) => void; // Replace with actual type of data to be returned on change
  onClose: () => void;
  onSave: () => void;
  onTestConnection: () => void;
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
}: AddEditProviderModalProps) => {
  const header = <p className="add-edit-provider-modal-header">{mode === "add" ? "Add provider" : "Edit provider"}</p>;
  const footer = (
    <div className="add-edit-provider-modal-footer">
      <RQButton
        type="secondary"
        className="test-connection-button"
        onClick={onTestConnection}
        icon={<NetworkPingIcon />}
      >
        Test connecion
      </RQButton>
      <div className="footer-right-section">
        <RQButton type="secondary" className="cancel-button" onClick={onClose}>
          Cancel
        </RQButton>
        <RQButton type="secondary" className="add-provider-button">
          {mode === "add" ? "Add provider" : "Save changes"}
        </RQButton>
      </div>
    </div>
  );
  return (
    <Modal
      title={header}
      width={480}
      open={true}
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
          onValueChange={() => {}}
          status="error"
          suffix={errorSuffix("Error message")}
        />
        <SelectField label="Secret manager" id="secret-manager" />
        <SelectField label="Auth method" options={authMethodOptions} id="auth-method" />
        <InputPasswordField label="Access key" id="access-key" />
        <InputPasswordField label="Secret key" id="secret-key" />
        <InputPasswordField label="Session token" id="session-token" />
        <SelectField label="Region" options={regionsList} id="region" />
      </div>
    </Modal>
  );
};
