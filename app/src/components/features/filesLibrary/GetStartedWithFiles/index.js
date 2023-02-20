//DEPRECATED
import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Button, Space } from "antd";
import ProCard from "@ant-design/pro-card";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
// Icons
import { EditOutlined } from "@ant-design/icons";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import NewMockSelector from "../FilesLibraryTableContainer/FilesTable/mockModal";
import UploadFileBtn from "../UploadFileBtn";
import { redirectToCreateNewFile } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const GetStartedWithFiles = ({ updateCollection }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const path = window.location.pathname;
  const isMockServerPage = path.includes("mock-server");
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [
    isNewRuleSelectorModalActive,
    setIsNewRuleSelectorModalActive,
  ] = useState(false);

  const toggleNewRuleSelectorModal = () => {
    setIsNewRuleSelectorModalActive(
      isNewRuleSelectorModalActive ? false : true
    );
  };

  const handleSeeDemoClick = () => {
    window.open("https://youtu.be/l2RxXQxQ3SI");
  };

  const openAuthModal = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          userActionMessage: `${
            isMockServerPage
              ? "Sign up to Create Mock APIs"
              : "Sign up to start using File Hosting"
          }`,
          eventSource: `${
            isMockServerPage
              ? AUTH.SOURCE.CREATE_API_MOCK
              : AUTH.SOURCE.CREATE_FILE_MOCK
          }`,
        },
      })
    );
  }, [dispatch, isMockServerPage]);

  const handleCreateMock = () => {
    if (user.loggedIn) {
      path.includes("my-mocks")
        ? redirectToCreateNewFile(navigate, "API")
        : setIsNewRuleSelectorModalActive(true);
    } else {
      openAuthModal();
    }
  };
  if (isWorkspaceMode)
    return (
      <TeamFeatureComingSoon
        title={isMockServerPage ? "Mock server" : "File server"}
      />
    );

  return (
    <ProCard className="primary-card github-like-border">
      <Row style={{ textAlign: "center" }} align="center">
        <Col span={24}>
          <Jumbotron className="text-center">
            <h1 className="display-3">
              {isMockServerPage ? "Mock Server" : "File Server"}
            </h1>
            <p>
              {isMockServerPage ? (
                <>
                  Create <b>mocks for your API's</b> with{" "}
                  <b>different status codes</b>, <b>reponse delay</b>,{" "}
                  <b>response headers</b> or <b>body</b>.
                </>
              ) : (
                <>
                  You can host static files like <b>HTML</b>, <b>CSS</b>,{" "}
                  <b>JS</b> or even<b> Images</b>.
                </>
              )}
              <Button
                type="link"
                color="secondary"
                onClick={() =>
                  window.open(
                    APP_CONSTANTS.LINKS.REQUESTLY_DOCS_MOCK_SERVER,
                    "_blank"
                  )
                }
              >
                Read Docs
              </Button>
            </p>
            <Space>
              <AuthConfirmationPopover
                title={
                  path.includes("my-mocks")
                    ? "You need to sign up to create API mocks"
                    : "You need to sign up to create file mocks"
                }
                disabled={user?.details?.isLoggedIn}
                onConfirm={handleCreateMock}
                source={
                  path.includes("my-mocks")
                    ? AUTH.SOURCE.CREATE_API_MOCK
                    : AUTH.SOURCE.CREATE_FILE_MOCK
                }
              >
                <Button
                  className="btn-icon btn-3"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={user?.details?.isLoggedIn && handleCreateMock}
                >
                  {path.includes("my-mocks")
                    ? "Create API Mock"
                    : "Create File Mock"}
                </Button>
              </AuthConfirmationPopover>
              {path.includes("my-mocks") ? null : (
                <UploadFileBtn
                  updateCollection={updateCollection}
                  buttonType="secondary"
                />
              )}
              <Button
                className="btn-icon btn-3"
                type="secondary"
                onClick={() => handleSeeDemoClick()}
              >
                See Demo
              </Button>
            </Space>
          </Jumbotron>
        </Col>
      </Row>
      {isNewRuleSelectorModalActive ? (
        <NewMockSelector
          isOpen={isNewRuleSelectorModalActive}
          toggle={toggleNewRuleSelectorModal}
        />
      ) : null}
    </ProCard>
  );
};

export default GetStartedWithFiles;
