import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import React from "react";
import ProCard from "@ant-design/pro-card";
import { Col } from "antd";

const UpdateSubscriptionContactUs = () => {
  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border" title={null}>
        <Col span={12} offset={6} className="hp-mt-24">
          <center>
            <img alt="" style={{ maxHeight: "50vh" }} src={"/assets/media/components/wip.gif"} />
            <div className="hp-landing-hero-title hp-text-center hp-mt-64 hp-px-24">
              <p className="h4 hp-font-weight-400 hp-text-color-black-60">
                Meanwhile, to make changes to your subscription or add more users to your plan, please say us Hi at{" "}
                <a
                  className="has-no-text-decoration"
                  href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>{GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}</strong>
                </a>
                .
              </p>
            </div>
          </center>
        </Col>
      </ProCard>
    </React.Fragment>
  );
};

export default UpdateSubscriptionContactUs;
