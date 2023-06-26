import React from "react";
import { ModalProps } from "antd";
import { RQModal } from "lib/design-system/components";
import ExtensionDeactivationMessage from "../../ExtensionDeactivationMessage";
import InstallExtensionCTA from "../index";
import { InstallExtensionContent } from "../type";
import "./installExtensionModal.css";

interface Props extends ModalProps, InstallExtensionContent {
  /**
   * If true then modal will render <ExtensionDeactivationMessage/> component
   */
  disabled?: boolean;
}

const InstallExtensionModal: React.FC<Props> = ({
  open,
  onCancel,
  heading,
  subHeading,
  eventPage,
  disabled = false,
  ...props
}) => {
  return (
    <RQModal
      centered
      open={open}
      maskClosable={false}
      onCancel={onCancel}
      width={"995px"}
      className="install-extension-modal-container"
    >
      {disabled ? (
        <ExtensionDeactivationMessage />
      ) : (
        <InstallExtensionCTA heading={heading} subHeading={subHeading} eventPage={eventPage} />
      )}
    </RQModal>
  );
};

export default InstallExtensionModal;
