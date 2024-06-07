import { CompanyMarquee } from "components/misc/Marquee";
import React from "react";
import ChromeStoreStats from "../../ChromeStoreStats";
import { Col, Row } from "antd";
import "./index.css";

const TrustedByOrgsSection = () => {
  return (
    <>
      <Row>
        <Col span={12} offset={6}>
          <div>
            <ChromeStoreStats />
            <div className="text-gray text-center">Trusted by developer & QA teams from 50,000+ organizations</div>
            <div className="company-marquee-wrapper">
              <CompanyMarquee />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default TrustedByOrgsSection;
