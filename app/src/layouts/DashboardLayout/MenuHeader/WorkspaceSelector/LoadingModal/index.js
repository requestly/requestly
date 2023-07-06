import { Modal } from "antd";
import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import AstronautAnimation from "components/misc/LottieAnimation/AstronautAnimation";

const LoadingModal = ({ isModalOpen, closeModal }) => {
  return (
    <Modal title={null} open={isModalOpen} onCancel={closeModal} footer={null} closeIcon={<></>} destroyOnClose={true}>
      <center>
        <AstronautAnimation animationName="switching-workspace" style={{ height: 300, width: 300 }} />
        <span>
          <LoadingOutlined spin className="mr-2" /> Switching workspace
        </span>
      </center>
    </Modal>
  );
};

export default LoadingModal;
