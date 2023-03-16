import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button, Space } from "antd";
//Sub Components
import NewRuleSelector from "../NewRuleSelector";
import ImportRulesModal from "../ImportRulesModal";
// Constants
import ProCard from "@ant-design/pro-card";
import { getAppMode } from "store/selectors";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useNavigate } from "react-router-dom";
import { redirectToTeam } from "utils/RedirectionUtils";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import lottie from "lottie-web/build/player/lottie_light";
import teamSolvingPuzzle from "assets/lottie/team-solving-puzzle.json";
import APP_CONSTANTS from "config/constants";
import Logger from "lib/logger";

const CreateTeamRuleCTA = () => {
  const navigate = useNavigate();
  //Global State
  const dispatch = useDispatch();
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const appMode = useSelector(getAppMode);
  //Component State
  const [
    isNewRuleSelectorModalActive,
    setIsNewRuleSelectorModalActive,
  ] = useState(false);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(
    false
  );

  const toggleNewRuleSelectorModal = () => {
    setIsNewRuleSelectorModalActive(
      isNewRuleSelectorModalActive ? false : true
    );
  };
  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  useEffect(() => {
    try {
      lottie.destroy("CreateTeamRuleCTA-teamSolvingPuzzle");
    } catch (_e) {
      Logger.log("Error Loading teamSolvingPuzzle");
    }
    lottie.loadAnimation({
      name: "CreateTeamRuleCTA-teamSolvingPuzzle",
      container: document.querySelector("#CreateTeamRuleCTA-teamSolvingPuzzle"),
      animationData: teamSolvingPuzzle,
      renderer: "svg", // "canvas", "html"
      loop: true, // boolean
      autoplay: true, // boolean
    });
  }, []);

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron
              style={{ background: "transparent" }}
              className="text-center"
            >
              <center>
                <div
                  id="CreateTeamRuleCTA-teamSolvingPuzzle"
                  style={{ height: 150, width: 150 }}
                />
              </center>
              <br />
              <br />
              <h1 className="display-3">This is a shared workspace</h1>
              <p className="lead">
                Rules created here can be accessed by your teammates. To manage
                your teammates click{" "}
                <a
                  href="https://requestly.io/"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    redirectToTeam(navigate, currentlyActiveWorkspace.id);
                  }}
                >
                  here
                </a>
                .
              </p>

              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    navigate(APP_CONSTANTS.PATHS.RULES.CREATE);
                  }}
                >
                  Create your first rule
                </Button>
                <Button
                  color="secondary"
                  onClick={() => setIsImportRulesModalActive(true)}
                >
                  Upload Rules
                </Button>
              </Space>

              <p className="lead mt-5" style={{ marginTop: "1em" }}>
                If you have existing Rules you can{" "}
                <Button
                  type="link"
                  onClick={() =>
                    clearCurrentlyActiveWorkspace(dispatch, appMode)
                  }
                  style={{ paddingLeft: "0", paddingRight: "0" }}
                >
                  <strong>switch to personal workspace</strong>
                </Button>
                , export them and import here.
              </p>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>

      {isNewRuleSelectorModalActive ? (
        <NewRuleSelector
          isOpen={isNewRuleSelectorModalActive}
          toggle={toggleNewRuleSelectorModal}
        />
      ) : null}
      {isImportRulesModalActive ? (
        <ImportRulesModal
          isOpen={isImportRulesModalActive}
          toggle={toggleImportRulesModal}
        />
      ) : null}
    </React.Fragment>
  );
};

export default CreateTeamRuleCTA;
