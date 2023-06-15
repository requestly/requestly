/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import { Button, Col, Form, Input, Row, Typography } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import { redirectToTeam } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import lottie from "lottie-web/build/player/lottie_light";
import teamSolvingPuzzle from "assets/lottie/teamwork-solve-puzzle.json";
import { trackNewTeamCreateFailure, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { trackNewWorkspaceCreated } from "modules/analytics/events/common/teams";
import Logger from "lib/logger";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const CreateWorkspace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  // Component State
  const [isSubmitProcess, setIsSubmitProcess] = useState(false);

  const onFinish = (filledData) => {
    const newTeamName = filledData.workspaceName;
    // Set Loader
    setIsSubmitProcess(true);
    // Create New Team
    const functions = getFunctions();
    const createTeam = httpsCallable(functions, "teams-createTeam");
    createTeam({
      teamName: newTeamName,
    })
      .then((response) => {
        trackNewWorkspaceCreated();
        toast.info("Workspace Created");
        const teamId = response.data.teamId;
        setIsSubmitProcess(false);
        switchWorkspace(
          {
            teamId,
            teamName: newTeamName,
            teamMembersCount: 1,
          },
          dispatch,
          {
            isSyncEnabled: user?.details?.isSyncEnabled,
            isWorkspaceMode,
          },
          appMode
        );
        redirectToTeam(navigate, teamId, {
          state: {
            isNewTeam: true,
          },
        });
        trackNewTeamCreateSuccess(teamId, newTeamName);
      })
      .catch((err) => {
        toast.error("Unable to Create Team");
        trackNewTeamCreateFailure(newTeamName);
        setIsSubmitProcess(false);
      });
  };

  const onFinishFailed = () => {
    toast.error("Please enter valid details");
  };

  useEffect(() => {
    try {
      lottie.destroy("CreateWorkspace-teamSolvingPuzzle");
    } catch (_e) {
      Logger.log("Loading teamSolvingPuzzle");
    }
    lottie.loadAnimation({
      name: "CreateWorkspace-teamSolvingPuzzle",
      container: document.querySelector("#CreateWorkspace-teamSolvingPuzzle"),
      animationData: teamSolvingPuzzle,
      renderer: "svg", // "canvas", "html"
      loop: 1, // boolean
      autoplay: true, // boolean
    });
  }, []);

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row align="middle" justify="center">
          <Col span={10} align="center">
            <Row>
              <Col className="hp-text-center" span={24}>
                <Typography.Title level={2}>Create a Workspace</Typography.Title>
                <center>
                  <div id="CreateWorkspace-teamSolvingPuzzle" style={{ height: "35vh" }} />
                </center>
                <Form
                  layout="vertical"
                  name="basic"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                >
                  <Form.Item
                    label="Name your workspace"
                    name="workspaceName"
                    className="hp-mb-16 hp-text-left"
                    rules={[
                      {
                        required: true,
                        message: "Please give a name to your workspace.",
                      },
                    ]}
                  >
                    <Input placeholder="eg: Amazon Global QA Team" />
                  </Form.Item>

                  <Form.Item className="hp-mb-0">
                    <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} loading={isSubmitProcess}>
                      Create Workspace
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default CreateWorkspace;
