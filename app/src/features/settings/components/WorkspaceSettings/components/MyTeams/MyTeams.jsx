import React from "react";
import { Card } from "reactstrap";
//SUB COMPONENTS
import ManageTeams from "../../../Profile/ManageTeams";
import TeamWideAnimation from "components/misc/LottieAnimation/TeamWideAnimation";
import { Col } from "antd";
import "./index.scss";

const MyTeams = () => {
  return (
    <Col className="workspace-settings-container">
      {/* Page content */}
      <Card className="mt-4">
        <center>
          <TeamWideAnimation animationName="my-teams-animation" style={{ height: 100 }} />
        </center>
        <h1 style={{ textAlign: "center" }}>Requestly for QA & Development Teams</h1>
        <ManageTeams />
      </Card>
    </Col>
  );
};

export default MyTeams;
