import React from "react";
import { Col, Row } from "antd";
import { RulesCard } from "./components/RulesCard";
import ApiClientCard from "./components/ApiClientCard";
import UserAvatar from "../../assets/images/illustrations/avatar.svg?react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { APIMockingCard } from "./components/APIMockingCard";
import { HomeScreenProvider } from "./contexts";
import "./home.scss";

export const Home: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const displayName = user?.details?.profile?.displayName?.split(" ")[0] ?? "Guest";

  return (
    <HomeScreenProvider>
      <Col className="homepage-wrapper">
        <Col className="homepage-content">
          <Row className="welcome-message">
            <UserAvatar />
            <span>
              <b>Welcome {displayName}!</b> Glad to have you on Requestly. 🚀<i> Let’s go!</i>
            </span>
          </Row>
          <Row className="homepage-primary-cards-wrapper">
            <RulesCard />
            <ApiClientCard />
            <APIMockingCard />
          </Row>
        </Col>
      </Col>
    </HomeScreenProvider>
  );
};
