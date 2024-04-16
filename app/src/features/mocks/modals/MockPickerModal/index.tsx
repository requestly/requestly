import React from "react";
import { RQModal } from "lib/design-system/components";
import { MockListSource } from "features/mocks/types";
import MockList from "features/mocks/screens/mocksList/components/MocksList/MocksList";
import "./mockPickerModal.scss";

interface Props {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  mockSelectionCallback: (mockUrl: string) => void;
}

export const MockPickerModal: React.FC<Props> = ({ isVisible, onVisibilityChange, mockSelectionCallback }) => {
  return (
    <RQModal
      open={isVisible}
      centered
      onCancel={() => {
        onVisibilityChange(false);
      }}
      width={1200}
    >
      <div className="mock-picker-modal-body">
        <MockList mockSelectionCallback={mockSelectionCallback} source={MockListSource.PICKER_MODAL} />
      </div>
    </RQModal>
  );
};
