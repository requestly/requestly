import React from "react";
import { Modal } from "antd";

const RuleSimulatorModal = ({ isOpen, toggle, body, mode, title }) => {
  return (
    <>
      <Modal
        size="small"
        title={title}
        visible={isOpen}
        onCancel={toggle}
        footer={null}
        bodyStyle={{
          padding: "0",
          paddingTop: "20px",
          borderRadius: "4px",
        }}
        width="700px"
      ></Modal>
    </>
  );
};

export default RuleSimulatorModal;
