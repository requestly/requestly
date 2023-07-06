import React from "react";
import { Card } from "reactstrap";
//SUB COMPONENTS
import ManageTeams from "../../ManageTeams";
import TeamWideAnimation from "components/misc/LottieAnimation/TeamWideAnimation";

const MyTeams = () => {
  return (
    <React.Fragment>
      {/* Page content */}
      <Card className="mt-4">
        <center>
          <TeamWideAnimation animationName="my-teams-animation" style={{ height: 100 }} />
        </center>
        <h1 style={{ textAlign: "center" }}>Requestly for QA & Development Teams</h1>
        <ManageTeams />
      </Card>
    </React.Fragment>
  );
};

export default MyTeams;
