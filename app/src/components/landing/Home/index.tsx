import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { Row, Typography } from "antd";
import { FeatureTag } from "components/common/FeatureTag";
import { RQBadge } from "lib/design-system/components/RQBadge";
import developmentIcon from "../../../assets/icons/system.svg";
import testingIcon from "../../../assets/icons/bug.svg";
import debuggingIcon from "../../../assets/icons/flask.svg";
import { BsArrowRight } from "@react-icons/all-files/bs/BsArrowRight";
import FEATURES from "config/constants/sub/features";
import PATHS from "config/constants/sub/paths";
import { trackEcosystemFeatureClicked } from "modules/analytics/events/features/ecosystem";
import "./index.scss";

interface HomeFeature {
  featureHeader: FeatureHeaderDetails;
  featureCards: FeatureCardDetails[];
}
interface FeatureCardDetails {
  title: string;
  description: string;
  tag: string;
  navigateTo: string;
  highlightFeature?: boolean;
  analyticsContext: string;
}
interface FeatureHeaderDetails {
  title: string;
  description: string;
  icon: string;
}

const HOME_FEATURES: HomeFeature[] = [
  {
    featureHeader: {
      title: "Development",
      description: "Use the requestly tools to work with private servers and public APIs",
      icon: developmentIcon,
    },
    featureCards: [
      {
        title: "Make an API request",
        description: "Make a request to an API by specifying endpoint and other request attributes or import from cURL",
        tag: FEATURES.API_CLIENT,
        navigateTo: PATHS.API_CLIENT.RELATIVE,
        analyticsContext: "api_client",
      },
      {
        title: "Create a mock API",
        description: "Generate custom API responses without actually having a pre-built API or backend server",
        tag: FEATURES.MOCK_V2,
        navigateTo: PATHS.MOCK_SERVER_V2.RELATIVE,
        analyticsContext: "mock server",
      },
    ],
  },
  {
    featureHeader: {
      title: "Testing",
      description: "Edit incoming & outgoing request headers & bodies",
      icon: testingIcon,
    },
    featureCards: [
      {
        title: "Modify network requests",
        description: "Create rules to modify HTTP requests & responses - URL redirects, Modify APIs or Headers",
        tag: FEATURES.RULES,
        navigateTo: PATHS.RULES.MY_RULES.ABSOLUTE,
        analyticsContext: "http_rules",
      },
    ],
  },
  {
    featureHeader: {
      title: "Debugging",
      description: "Validate your solutions using tools like session replay",
      icon: debuggingIcon,
    },
    featureCards: [
      {
        title: "Debug faster with Session Replay",
        description: "Replay screen, mouse movement, network, console and more of any browser session.",
        tag: FEATURES.SESSION_RECORDING,
        navigateTo: PATHS.SESSIONS.RELATIVE,
        highlightFeature: true,
        analyticsContext: "session_recording",
      },
    ],
  },
];

export const Home: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  return (
    <div className="home-v2-container">
      <div className="home-v2-welcome-message">
        <Typography.Title className="welcome-title">
          Hello, {user.details?.profile?.displayName ?? "User"}
        </Typography.Title>
        <Typography.Text className="welcome-subtitle">Where do you want to start today?</Typography.Text>
      </div>
      <div className="home-v2-feature-grid-wrapper">
        {HOME_FEATURES.map(({ featureHeader, featureCards }, index) => {
          return (
            <div className="home-v2-feature-grid-item" key={index}>
              <FeatureHeader
                title={featureHeader.title}
                description={featureHeader.description}
                icon={featureHeader.icon}
              />
              {featureCards.map(
                ({ title, description, tag, navigateTo, highlightFeature, analyticsContext }, index) => {
                  return (
                    <FeatureCard
                      key={index}
                      title={title}
                      description={description}
                      tag={tag}
                      navigateTo={navigateTo}
                      highlightFeature={highlightFeature}
                      analyticsContext={analyticsContext}
                    />
                  );
                }
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FeatureHeader: React.FC<FeatureHeaderDetails> = ({ title, description, icon }) => {
  return (
    <div className="home-v2-grid-header">
      <img className="home-v2-grid-header-icon" src={icon} alt={title} />
      <div>
        <Typography.Title className="home-v2-grid-header-title">{title}</Typography.Title>
        <Typography.Text className="home-v2-grid-header-subtitle">{description}</Typography.Text>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardDetails> = ({
  title,
  description,
  tag,
  navigateTo,
  highlightFeature,
  analyticsContext,
}) => {
  return (
    <Link
      to={navigateTo}
      onClick={() => {
        trackEcosystemFeatureClicked(analyticsContext);
      }}
    >
      <div className={`${highlightFeature ? "highlight-feature-card" : null} home-feature-card-wrapper mt-16`}>
        {highlightFeature && (
          <div className="highlighted-feature-card-badge">
            <RQBadge badgeText="NEW" />
          </div>
        )}
        <div className="home-v2-grid-card">
          <Typography.Title className="home-v2-grid-card-title">{title}</Typography.Title>
          <Typography.Text className="home-v2-grid-card-description">{description}</Typography.Text>
          <Row justify="space-between" align="middle" className="mt-16">
            <FeatureTag feature={tag} />
            <div className="display-row-center get-started-text">
              Get started
              <BsArrowRight />
            </div>
          </Row>
        </div>
      </div>
    </Link>
  );
};
