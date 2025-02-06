import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "antd";
import { getAppMode } from "store/selectors";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import "./TeamFeatureComingSoon.css";

const TeamFeatureComingSoon = ({ title = "" }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  return (
    <Row className="team-feature-coming-soon-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        <div className="title text-bold">{title}</div>
        <p className="text-dark-gray team-feature-coming-soon-caption">
          We're working hard to bring this feature to shared workspace.
        </p>

        <div className="team-feature-banner">
          <img alt="file" className="file-icon" src="/assets/media/common/file.svg" />
          <div className="header">Coming soon!</div>
          <p className="text-dark-gray">
            Meanwhile you can{" "}
            <span
              title="Switch to personal workspace"
              className="text-underline cursor-pointer"
              onClick={() => clearCurrentlyActiveWorkspace(dispatch, appMode)}
            >
              switch to personal workspace
            </span>{" "}
            to use this feature.
          </p>
        </div>
      </Col>
    </Row>
  );
};

export default TeamFeatureComingSoon;
