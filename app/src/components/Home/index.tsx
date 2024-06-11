import React from "react";
import { Col, Row } from "antd";
import { ChangeLogCard } from "./components/ChangelogCard";
import { HelpCard } from "./components/HelpCard";
import { TeamsCard } from "./components/WorkspaceCard";
import { Templates } from "./components/Templates";
import { RulesCard } from "./components/RulesCard";
import { MocksCard } from "./components/MocksCard";
import { IncentivesCard } from "./components/IncentivesCard/IncentivesCard";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./home.scss";

export const Home: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const isIncentivizationEnabled = useFeatureIsOn("incentivization_onboarding");

  return (
    <Col className="homepage-wrapper">
      <Col className="homepage-content">
        {user.loggedIn && isIncentivizationEnabled && (
          <Col className="homepage-primary-card homepage-incentives-card">
            <IncentivesCard />
          </Col>
        )}

        <Row className="homepage-primary-cards-wrapper">
          <Col className="homepage-primary-card" xs={24} md={24} lg={12}>
            <RulesCard />
          </Col>
          <Col className="homepage-primary-card" xs={24} md={24} lg={12}>
            <MocksCard />
          </Col>
        </Row>
        <Templates />
        <Row className="homepage-bottom-section" wrap={false}>
          <Col xs={24} md={24} lg={12} className="homepage-teams-card homepage-primary-card" style={{ padding: 0 }}>
            <TeamsCard />
          </Col>
          <Col xs={24} md={24} lg={6} className="homepage-help-card homepage-primary-card">
            <HelpCard />
          </Col>
          <Col xs={24} md={24} lg={6} className="homepage-changelog-card homepage-primary-card">
            <ChangeLogCard />
          </Col>
        </Row>
      </Col>
    </Col>
  );
};
