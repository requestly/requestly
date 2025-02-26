import React from "react";
import { Col, Row } from "antd";
import { RulesCard } from "./components/RulesCard";
import { IncentivesCard } from "./components/IncentivesCard/IncentivesCard";
import { useIsIncentivizationEnabled } from "features/incentivization/hooks";
import ApiClientCard from "./components/ApiClientCard";
import UserAvatar from "../../assets/images/illustrations/avatar.svg?react";
import "./home.scss";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";

export const Home: React.FC = () => {
  const isIncentivizationEnabled = useIsIncentivizationEnabled();
  const user = useSelector(getUserAuthDetails);
  const displayName = user?.details?.profile?.displayName?.split(" ")[0] ?? "Guest";

  return (
    <Col className="homepage-wrapper">
      <Col className="homepage-content">
        {isIncentivizationEnabled && (
          <Col className="homepage-primary-card homepage-incentives-card">
            <IncentivesCard />
          </Col>
        )}
        <Row className="welcome-message">
          <UserAvatar />
          <span>
            <b>Welcome {displayName}!</b> Glad to have you on Requestly. 🚀<i> Let’s go!</i>
          </span>
        </Row>
        <Row className="homepage-primary-cards-wrapper">
          <RulesCard />
          <ApiClientCard />
        </Row>
      </Col>
    </Col>
  );
};
