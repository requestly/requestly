import React from "react";
import { ModalProps } from "antd";
import { RQModal } from "lib/design-system/components";
import ExtensionDeactivationMessage from "../ExtensionDeactivationMessage";
import InstallExtensionCTA from "./index";
import { InstallExtensionCTA as InstallExtensionCTAInterface } from "./type";

interface Props extends ModalProps, InstallExtensionCTAInterface {
  /**
   * If true then modal will render <ExtensionDeactivationMessage/> component
   */
  disabled: boolean;
}

const InstallExtensionModal: React.FC<Props> = ({
  open,
  onCancel,
  heading,
  subHeading,
  eventPage,
  width = "70%",
  ...props
}) => {
  const { disabled = false } = props;

  return (
    <RQModal centered open={open} maskClosable={false} onCancel={onCancel} width={width}>
      {disabled ? (
        <ExtensionDeactivationMessage />
      ) : (
        <InstallExtensionCTA heading={heading} subHeading={subHeading} eventPage={eventPage} />
      )}
    </RQModal>
  );
};

export default InstallExtensionModal;
