import { Modal } from "antd";
import React from "react";
import MockListIndex, { MockListSource } from "../MockList";

interface Props {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  mockSelectionCallback: (mockUrl: string) => void;
}

const MockPickerModal: React.FC<Props> = ({ isVisible, onVisibilityChange, mockSelectionCallback }) => {
  const renderMockList = () => {
    return <MockListIndex mockSelectionCallback={mockSelectionCallback} source={MockListSource.PICKER_MODAL} />;
  };

  return (
    //fix picker modal in v1
    <Modal
      style={{ maxWidth: "900px" }}
      visible={isVisible}
      centered
      onCancel={() => {
        onVisibilityChange(false);
      }}
      footer={null}
      width="100%"
      // title={titleBar}
    >
      {renderMockList()}
    </Modal>
  );
};

export default MockPickerModal;
