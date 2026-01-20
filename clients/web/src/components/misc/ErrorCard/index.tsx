import React from "react";
import { Row, Col, Alert } from "antd";
import "./ErrorCard.css";

interface ErrorCardProps {
  customErrorMessage: string;
  type?: "success" | "info" | "warning" | "error";
}

const ErrorCard: React.FC<ErrorCardProps> = (props) => {
  const errorMessage = props.customErrorMessage || "Something went wrong";
  return (
    <Row justify="center" className="error-card">
      <Col span={18}>
        <Alert message={errorMessage} type={props.type} showIcon />
      </Col>
    </Row>
  );
};

export default ErrorCard;
