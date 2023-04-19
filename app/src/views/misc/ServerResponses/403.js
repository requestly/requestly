import React from "react";
import { useNavigate } from "react-router-dom";
// Static
import { Result, Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { redirectToRules } from "utils/RedirectionUtils";

const Page403 = () => {
  const navigate = useNavigate();
  return (
    <>
      <Result
        status="403"
        title="Oops! No access"
        subTitle="Oops! Looks like you are not authorized to access this
        page. Don't worry though, everything is STILL AWESOME!"
        extra={
          <Button type="primary" onClick={() => redirectToRules(navigate)} icon={<LeftOutlined />}>
            Back Home
          </Button>
        }
      />
    </>
  );
};

export default Page403;
