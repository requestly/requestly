import React from "react";
import { Skeleton } from "antd";

const SpinnerCard = (props) => {
  // const { skeletonType = "list" } = props;
  return (
    <div
      className="spinner-card"
      style={{
        padding: 24,
      }}
    >
      <Skeleton loading={true} />
    </div>
  );
};

export default SpinnerCard;
