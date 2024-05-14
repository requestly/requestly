import React from "react";
import { RQModal } from "lib/design-system/components";
import { MockListSource } from "components/features/mocksV2/types";
import MockList from "features/mocks/screens/mocksList/components/MocksList/MocksList";
import { MocksContextProvider } from "features/mocks/contexts";
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
      width={800}
    >
      <div className="mock-picker-modal-body">
        <MocksContextProvider>
          <MockList mockSelectionCallback={mockSelectionCallback} source={MockListSource.PICKER_MODAL} />
        </MocksContextProvider>
      </div>
    </RQModal>
  );
};
