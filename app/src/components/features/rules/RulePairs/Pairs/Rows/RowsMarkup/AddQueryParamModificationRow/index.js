import React from "react";
import { Row, Col, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const AddQueryParamModificationRow = ({
  rowIndex,
  helperFunctions,
  isInputDisabled,
}) => {
  const { addEmptyModification } = helperFunctions;
  return (
    <Row className="margin-top-one" key={rowIndex}>
      <Col offset={4} span={20}>
        <Button
          type="dashed"
          onClick={addEmptyModification}
          icon={<PlusOutlined />}
          disabled={isInputDisabled}
        >
          <span className="btn-inner--text">Add Modification</span>
        </Button>
      </Col>
    </Row>
  );
};

export default AddQueryParamModificationRow;
