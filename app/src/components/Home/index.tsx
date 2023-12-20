import React from "react";
import { Col, Row } from "antd";
import { RulesCard } from "./components/RulesCard";
import "./home.scss";

export const Home: React.FC = () => {
  return (
    <Col className="homepage-wrapper">
      <Col className="homepage-content">
        <Row className="homepage-primary-cards-wrapper">
          <Col className="homepage-primary-card" span={12}>
            <RulesCard />
          </Col>
          <Col className="homepage-primary-card" span={12}>
            Session here
          </Col>
        </Row>
      </Col>
    </Col>
  );
};
