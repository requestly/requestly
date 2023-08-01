import React from "react";
import MockListIndex from "../MockList";
import { MockListSource } from "../types";
import { RQModal } from "lib/design-system/components";
import "./mockPickerModal.scss";

interface Props {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  mockSelectionCallback: (mockUrl: string) => void;
}

const MockPickerModal: React.FC<Props> = ({ isVisible, onVisibilityChange, mockSelectionCallback }) => {
  return (
    <RQModal
      open={isVisible}
      centered
      onCancel={() => {
        onVisibilityChange(false);
      }}
      width={900}
    >
      <div className="mock-picker-modal-body">
        <MockListIndex mockSelectionCallback={mockSelectionCallback} source={MockListSource.PICKER_MODAL} />
      </div>
    </RQModal>
  );
};

export default MockPickerModal;
