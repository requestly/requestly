import React from "react";
import { RQModal } from "lib/design-system/components";
import NewFileTypeSelector from "./NewFileTypeSelector";
import "./NewFileModal.css";

interface Props {
  toggleModalVisiblity: (visible: boolean) => void;
  visible?: boolean;
}

export const NewFileModal: React.FC<Props> = ({ visible, toggleModalVisiblity }) => {
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
