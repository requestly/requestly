import { ArrowRightOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import { Result } from "antd";
import { RQButton } from "lib/design-system/components";
import React from "react";
import { useNavigate } from "react-router-dom";
// Utils
import { redirectToRules } from "../../../../utils/RedirectionUtils";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <>
      <ProCard className="primary-card github-like-border">
        <Result
          status="success"
          title="Successfully subscribed to Requestly Premium!"
          subTitle="Account activation takes 1-2 minutes, please wait. You will shortly receive the receipt on your
          email address."
          extra={[
            <RQButton
              type={"primary"}
              onClick={() => redirectToRules(navigate, true)}
              key="go-back"
              icon={<ArrowRightOutlined />}
            >
              Start using Requestly Premium
            </RQButton>,
          ]}
        />
      </ProCard>
    </>
  );
};

export default PaymentSuccess;
