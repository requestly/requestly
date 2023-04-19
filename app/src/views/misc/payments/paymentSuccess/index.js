import { ArrowRightOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import { Result, Button } from "antd";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// Utils
import { redirectToTeam, redirectToRules } from "../../../../utils/RedirectionUtils";
import { trackCheckoutCompletedEvent } from "modules/analytics/events/misc/business/checkout";
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const teamId = params.get("t");
  const usersCount = params.get("q");

  trackCheckoutCompletedEvent();

  return (
    <>
      <ProCard className="primary-card github-like-border">
        <Result
          status="success"
          title="Successfully subscribed to Requestly Premium!"
          subTitle="Account activation takes 1-2 minutes, please wait. You will shortly receive the receipt on your
          email address."
          extra={[
            <Button
              type={usersCount === 1 ? "primary" : "secondary"}
              onClick={() => redirectToRules(navigate, true)}
              key="go-back"
              icon={<ArrowRightOutlined />}
            >
              Start using Requestly Premium
            </Button>,
            usersCount > 1 ? (
              <Button
                type="primary"
                onClick={() => redirectToTeam(navigate, teamId, { hardRedirect: true })}
                key="go-to-teams"
              >
                Manage your Team
              </Button>
            ) : null,
          ]}
        />
      </ProCard>
    </>
  );
};

export default PaymentSuccess;
