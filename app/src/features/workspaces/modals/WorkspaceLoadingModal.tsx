import React from "react";

import { LoadingOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import AstronautAnimation from "componentsV2/LottieAnimation/AstronautAnimation";

interface Props {
  isOpen: boolean;
  close: () => void;
}

const WorkspaceLoadingModal: React.FC<Props> = ({ isOpen, close }) => {
  return (
    <Modal title={null} open={isOpen} onCancel={close} footer={null} closeIcon={<></>} destroyOnClose={true}>
      <center>
        <AstronautAnimation animationName="loading-workspace" style={{ height: 300, width: 300 }} />
        <span>
          <LoadingOutlined spin className="mr-2" /> Loading Workspace
        </span>
      </center>
    </Modal>
  );
};

export default WorkspaceLoadingModal;
