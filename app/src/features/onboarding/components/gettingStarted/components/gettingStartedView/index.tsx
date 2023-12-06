import React from "react";
import { useSelector } from "react-redux";
import { getAppOnboardingDetails, getUserAuthDetails } from "store/selectors";
import { Col, Row, Typography } from "antd";
import { RecommendationView } from "../recommendations/components/recommendationView";
import "./index.scss";

export const GettingStartedView: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const name =
    user.details.profile.displayName !== "User" ? user.details.profile.displayName : appOnboardingDetails.fullName;

  return (
    <Col className="getting-started-screen-wrapper">
      {/* BANNER */}

      <Col className="getting-started-screen-banner">
        <div className="get-started-title">GET STARTED</div>
        <Typography.Title level={3} className="welcome-title">
          Welcome to Requestly, {name}!
        </Typography.Title>
        <Typography.Title level={5} className="getting-started-banner-by-line">
          Select an option below to get started quickly
        </Typography.Title>
      </Col>
      <Row className="getting-started-body">
        <Col className="getting-started-teams-wrapper">TEAMS</Col>
        <Col className="getting-started-recommendations-wrapper">
          <RecommendationView />
        </Col>
      </Row>
    </Col>
  );
};
