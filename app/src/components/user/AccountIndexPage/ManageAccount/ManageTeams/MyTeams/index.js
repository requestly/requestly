import React, { useEffect } from "react";
import { Card } from "reactstrap";
//SUB COMPONENTS
import ManageTeams from "../../ManageTeams";
import teamAnimation from "assets/lottie/team-wide.json";
import lottie from "lottie-web/build/player/lottie_light";

const MyTeams = () => {
  useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector("#MyTeams-teamAnimation"),
      animationData: teamAnimation,
      renderer: "svg", // "canvas", "html"
      loop: false, // boolean
      autoplay: true, // boolean
    });
  }, []);

  return (
    <React.Fragment>
      {/* Page content */}
      <Card className="mt-4">
        <center>
          <div id="MyTeams-teamAnimation" style={{ height: 100 }} />
        </center>
        <h1 style={{ textAlign: "center" }}>Requestly for QA & Development Teams</h1>

        <ManageTeams />
      </Card>
    </React.Fragment>
  );
};

export default MyTeams;
