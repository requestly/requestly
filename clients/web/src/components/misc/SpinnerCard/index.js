import React from "react";
import { Skeleton } from "antd";

const SpinnerCard = (props) => {
  return (
    <div className="spinner-card">
      <Skeleton loading={true} />
    </div>
  );
};

export default SpinnerCard;
