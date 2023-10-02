import React from "react";
import { Col } from "reactstrap";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { Skeleton } from "antd";

const SpinnerColumn = (props) => {
  const { message, skeletonCount = 1 } = props;

  const renderMessage = () => {
    if (message) {
      return (
        <h3>
          <span>
            <FaSpinner className="icon-spin fix-icon-is-up" /> &nbsp; {message}
          </span>
        </h3>
      );
    }

    return null;
  };

  return (
    <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
      <Jumbotron style={{ background: "transparent" }} className="text-center">
        {renderMessage()}
        {Array(skeletonCount)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} loading={true} style={{ padding: "1.5rem 1.5rem 8px 1.5rem" }} />
          ))}
      </Jumbotron>
    </Col>
  );
};

export default SpinnerColumn;
