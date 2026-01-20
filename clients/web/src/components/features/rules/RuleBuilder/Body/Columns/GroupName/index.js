import React from "react";
import { DownOutlined } from "@ant-design/icons";

const GroupName = (props) => {
  const { setIsChangeRuleGroupModalActive, currentlySelectedGroup } = props;
  return (
    <b onClick={() => setIsChangeRuleGroupModalActive(true)} style={{ cursor: "pointer" }}>
      {`${currentlySelectedGroup}`} <DownOutlined />
    </b>
  );
};

export default GroupName;
