import React from "react";
import { Row, Col, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./AddCustomScriptRow.css";

const AddCustomScriptRow = ({ rowIndex, helperFunctions }) => {
  const { addEmptyScript } = helperFunctions;

  return (
    <Row className="margin-top-one" key={rowIndex}>
      <Col span={24}>
        <Button
          block
          size="small"
          type="dashed"
          onClick={addEmptyScript}
          icon={<PlusOutlined />}
          className="add-custom-script-btn"
        >
          <>
            <span className="mr-1">Insert Custom Script</span>
            <span className="text-gray">(scripts are executed serially)</span>
          </>
        </Button>
      </Col>
    </Row>
  );
};

export default AddCustomScriptRow;
