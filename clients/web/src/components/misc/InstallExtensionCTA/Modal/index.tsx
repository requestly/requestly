import React from "react";
import { ModalProps } from "antd";
import { RQModal } from "lib/design-system/components";
import ExtensionDeactivationMessage from "../../ExtensionDeactivationMessage";
import InstallExtensionCTA from "../index";
import { InstallExtensionContent } from "../type";
import { getAppFlavour } from "utils/AppUtils";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import InstallSessionBearExtensionCTA from "../../../../src-SessionBear/components/InstallSessionBearCTA";
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
  const appFlavour = getAppFlavour();

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
        <>
          {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? (
            <InstallSessionBearExtensionCTA heading={heading} subHeading={subHeading} eventPage={eventPage} />
          ) : (
            <InstallExtensionCTA heading={heading} subHeading={subHeading} eventPage={eventPage} />
          )}
        </>
      )}
    </RQModal>
  );
};

export default InstallExtensionModal;
