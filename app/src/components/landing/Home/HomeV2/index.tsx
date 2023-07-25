import React from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Typography } from "antd";
import developmentIcon from "../../../../assets/icons/system.svg";
import testingIcon from "../../../../assets/icons/bug.svg";
import debuggingIcon from "../../../../assets/icons/flask.svg";
import "./index.scss";
import { GridCards } from "./GridCard";
import { HomeEcosystemTypes } from "./types";

export const HomeV2: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  return (
    <div className="home-v2-container">
      <div className="home-v2-welcome-message">
        <Typography.Title className="welcome-title">
          Hello, {user?.loggedIn ? user.details.profile.displayName : "User"}
        </Typography.Title>
        <Typography.Text className="welcome-subtitle">Where do you want to start today?</Typography.Text>
      </div>
      <div className="home-v2-feature-grid-wrapper">
        <div className="home-v2-feature-grid-item">
          <GridHeader
            title="Development"
            description="Use the requestly tools to work with private servers and public APIs"
            icon={developmentIcon}
          />
          <GridCards ecosystemType={HomeEcosystemTypes.DEVELOPMENT} />
        </div>
        <div className="home-v2-feature-grid-item">
          <GridHeader
            title="Testing"
            description="Edit incoming & outgoing request headers & bodies "
            icon={testingIcon}
          />
          <GridCards ecosystemType={HomeEcosystemTypes.TESTING} />
        </div>
        <div className="home-v2-feature-grid-item">
          <GridHeader
            title="Debugging"
            description="Validate your solutions using screen recording, delaying responses & more"
            icon={debuggingIcon}
          />
          <GridCards ecosystemType={HomeEcosystemTypes.DEBUGGING} />
        </div>
      </div>
    </div>
  );
};

const GridHeader: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => {
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
