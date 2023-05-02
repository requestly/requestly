import React from "react";
import { Modal } from "antd";

import CodeEditor from "components/misc/CodeEditor";

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
      >
        <CodeEditor height={300} language={mode} defaultValue={body} value={body} readOnly={true} />
      </Modal>
    </>
  );
};

export default RuleSimulatorModal;
