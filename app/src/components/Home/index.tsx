import React from "react";
import { Col, Row } from "antd";
import { ChangeLogCard } from "./components/ChangelogCard";
import { HelpCard } from "./components/HelpCard";
import "./home.scss";

export const Home: React.FC = () => {
  return (
    <Col className="homepage-wrapper">
      <Col className="homepage-content">
        <Row className="homepage-primary-cards-wrapper">
          <Col className="homepage-primary-card" span={12}>
            <>RULES HERE</>
          </Col>
          <Col className="homepage-primary-card" span={12}>
            <>SESSIONS HERE</>
          </Col>
        </Row>
        <Row>TEMPLATES HERE</Row>
        <Row className="homepage-bottom-section">
          <Col span={12} className="homepage-teams-card homepage-primary-card">
            {/* <TeamsCard /> */}
            <>TEAMS HERE</>
          </Col>
          <Col span={6} className="homepage-help-card homepage-primary-card">
            <HelpCard />
          </Col>
          <Col span={6} className="homepage-changelog-card homepage-primary-card">
            <ChangeLogCard />
          </Col>
        </Row>
      </Col>
    </Col>
  );
};
