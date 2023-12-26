import React from "react";
import { Col, Row } from "antd";
import "./home.scss";
import { SessionsCard } from "./components/SessionsCard";

export const Home: React.FC = () => {
  return (
    <Col className="homepage-wrapper">
      <Col className="homepage-content">
        <Row className="homepage-primary-cards-wrapper">
          <Col className="homepage-primary-card" span={12}>
            <>RULES HERE</>
          </Col>
          <Col className="homepage-primary-card" span={12}>
            <SessionsCard />
          </Col>
        </Row>
      </Col>
    </Col>
  );
};
