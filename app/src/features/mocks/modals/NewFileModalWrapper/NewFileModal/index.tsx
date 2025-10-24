import React from "react";
import { RQModal } from "lib/design-system/components";
import NewFileTypeSelector from "./NewFileTypeSelector";
import "./NewFileModal.css";

interface Props {
  collectionId: string;
  toggleModalVisiblity: (visible: boolean) => void;
  visible?: boolean;
}

export const NewFileModal: React.FC<Props> = ({ visible, toggleModalVisiblity, collectionId = "" }) => {
  return (
    <RQModal
      open={visible}
      centered
      onCancel={() => toggleModalVisiblity(false)}
      footer={null}
      title="Host New File"
      wrapClassName="new-file-modal"
      bodyStyle={{ padding: "1.5rem" }}
      width={400}
    >
      <NewFileTypeSelector collectionId={collectionId} />
    </RQModal>
  );
};
