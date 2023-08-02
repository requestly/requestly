import React from "react";
import { RQModal } from "lib/design-system/components";
import "./NewFileModal.css";
import NewFileTypeSelector from "./NewFileTypeSelector";

interface Props {
  toggleModalVisiblity: (visible: boolean) => void;
  visible?: boolean;
}

const NewFileModal: React.FC<Props> = ({ visible, toggleModalVisiblity }) => {
  return (
    <RQModal
      open={visible}
      centered
      onCancel={() => toggleModalVisiblity(false)}
      footer={null}
      title="Host New File"
      wrapClassName="new-file-modal"
      bodyStyle={{ padding: "1.875rem" }}
      width={800}
    >
      <NewFileTypeSelector />
    </RQModal>
  );
};

export default NewFileModal;
