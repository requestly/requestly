import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button, Space } from "antd";
import { NewRuleSelector } from "../../NewRuleSelector";
import { ImportRulesModal } from "../../../../../../../modals/ImportRulesModal";
import ProCard from "@ant-design/pro-card";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useNavigate } from "react-router-dom";
import { redirectToTeam } from "utils/RedirectionUtils";
import TeamSolvingPuzzleAnimation from "componentsV2/LottieAnimation/TeamSolvingPuzzleAnimation";
import { globalActions } from "store/slices/global/slice";
import { RuleSelectionListDrawer } from "../../RuleSelectionListDrawer/RuleSelectionListDrawer";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackNewRuleButtonClicked, trackRulesEmptyStateClicked } from "modules/analytics/events/common/rules";
import "./CreateTeamRuleCTA.css";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { getLinkWithMetadata } from "modules/analytics/metadata";

export const CreateTeamRuleCTA = () => {
  const navigate = useNavigate();
  //Global State
  const dispatch = useDispatch();
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  //Component State
  const [isNewRuleSelectorModalActive, setIsNewRuleSelectorModalActive] = useState(false);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isRulesListDrawerOpen, setIsRulesListDrawerOpen] = useState(false);

  const onRulesListDrawerClose = () => {
    setIsRulesListDrawerOpen(false);
  };

  const handleNewRuleClick = () => {
    trackNewRuleButtonClicked(SOURCE.GETTING_STARTED);
    trackRulesEmptyStateClicked("create_your_first_rule");
    setIsRulesListDrawerOpen(true);
  };

  const toggleNewRuleSelectorModal = () => {
    setIsNewRuleSelectorModalActive(isNewRuleSelectorModalActive ? false : true);
  };
  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border create-team-rule-container">
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <center>
                <TeamSolvingPuzzleAnimation animationName="creating-team-rules" style={{ height: 150, width: 150 }} />
              </center>
              <br />
              <br />
              <h1 className="display-3">This is a shared workspace</h1>
              <p className="lead">
                Rules created here can be accessed by your teammates. To manage your teammates click{" "}
                <a
                  href={getLinkWithMetadata("https://requestly.com/")}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    redirectToTeam(navigate, activeWorkspaceId);
                  }}
                >
                  here
                </a>
                .
              </p>

              <Space>
                <RuleSelectionListDrawer
                  open={isRulesListDrawerOpen}
                  onClose={onRulesListDrawerClose}
                  source={SOURCE.GETTING_STARTED}
                  onRuleItemClick={() => {
                    onRulesListDrawerClose();
                  }}
                >
                  <Button type="primary" onClick={handleNewRuleClick}>
                    Create your first rule
                  </Button>
                </RuleSelectionListDrawer>

                <Button color="secondary" onClick={() => setIsImportRulesModalActive(true)}>
                  Upload Rules
                </Button>
              </Space>

              <p className="lead mt-5" style={{ marginTop: "1em" }}>
                If you have rules in another workspace, you can{" "}
                <Button
                  type="link"
                  onClick={() =>
                    dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: true }))
                  }
                  style={{ paddingLeft: "0", paddingRight: "0" }}
                >
                  <strong>switch to that workspace</strong>
                </Button>
                &nbsp; and use the <strong>Share rule</strong> option to copy the rule to this workspace.
              </p>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>

      {isNewRuleSelectorModalActive ? (
        <NewRuleSelector isOpen={isNewRuleSelectorModalActive} toggle={toggleNewRuleSelectorModal} />
      ) : null}
      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
    </React.Fragment>
  );
};
