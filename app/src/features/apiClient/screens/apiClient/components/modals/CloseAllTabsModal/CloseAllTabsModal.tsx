import { Modal } from "antd";
import "./closeAllTabsModal.scss";
import { BsExclamationTriangle } from "@react-icons/all-files/bs/BsExclamationTriangle";
import { RQButton } from "lib/design-system-v2/components";
interface CloseAllTabsModalProps {
  open: boolean;
  onClose: () => void;
  unSavedTabsCount: number;
  closeAllOpenTabs: (type: string) => void;
}

export const CloseAllTabsModal = ({ onClose, open, unSavedTabsCount, closeAllOpenTabs }: CloseAllTabsModalProps) => {
  const header = (
    <div className="close-all-tabs-modal-header">
      <BsExclamationTriangle />
      <span>{unSavedTabsCount} tabs have unsaved changes</span>
    </div>
  );

  const footer = (
    <div className="close-all-tabs-modal-footer">
      <RQButton type="secondary" className="text-bold" onClick={onClose}>
        Cancel
      </RQButton>
      <RQButton type="danger" className="close-without-saving-button" onClick={() => closeAllOpenTabs("force")}>
        Discard and close tabs
      </RQButton>
    </div>
  );
  return (
    <Modal
      title={header}
      width={480}
      open={open}
      maskClosable={false}
      destroyOnClose={true}
      className="close-all-tabs-modal"
      wrapClassName="close-all-tabs-modal-wrap"
      zIndex={1050}
      onCancel={onClose}
      footer={footer}
    >
      <div className="close-all-tabs-content">
        Closing all tabs will discard unsaved changes in {unSavedTabsCount} tabs. Do you want to continue and discard
        them?
      </div>
    </Modal>
  );
};
