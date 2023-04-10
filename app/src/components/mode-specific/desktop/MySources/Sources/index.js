import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Space, Card, Avatar, Button, Typography, Collapse } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "utils/Toast.js";
// SUB COMPONENTS
import CloseConfirmModal from "./ErrorHandling/CloseConfirmModal";
import { RQModal } from "lib/design-system/components";
// CONSTANTS
import APP_CONSTANTS from "../../../../../config/constants";
import { actions } from "../../../../../store";
// UTILS
import { getDesktopSpecificDetails } from "../../../../../store/selectors";
import { ArrowRightOutlined, PoweroffOutlined } from "@ant-design/icons";
import InstructionsModal from "./InstructionsModal";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import {
  trackAppConnectedEvent,
  trackAppDisconnectedEvent,
  trackAppConnectFailureEvent,
} from "modules/analytics/events/desktopApp/apps";
import { redirectToTraffic } from "utils/RedirectionUtils";
import Logger from "lib/logger";
import "./index.css";

const { Meta } = Card;
const { Panel } = Collapse;

const Sources = () => {
  const navigate = useNavigate();

  // Global State
  const dispatch = useDispatch();
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  // Component State
  const [processingApps, setProcessingApps] = useState({});
  const [isCloseConfirmModalActive, setIsCloseConfirmModalActive] = useState(false);
  const [appIdToCloseConfirm, setAppIdToCloseConfirm] = useState(false);
  const [appsListArray, setAppsListArray] = useState([]);

  const { appsList } = desktopSpecificDetails;

  const [currentApp, setCurrentApp] = useState(null);

  const appsListRef = useRef(null);

  const getAppName = (appId) => appsListRef.current[appId]?.name;

  useEffect(() => {
    appsListRef.current = appsList;
    setAppsListArray(Object.values(appsList));
  }, [appsList]);

  const toggleCloseConfirmModal = () => {
    if (isCloseConfirmModalActive) {
      setAppIdToCloseConfirm(false);
      setIsCloseConfirmModalActive(false);
    } else {
      setIsCloseConfirmModalActive(true);
    }
  };

  const handleCloseConfirmContinue = () => {
    if (!appIdToCloseConfirm) return;
    setIsCloseConfirmModalActive(false);
    handleActivateAppOnClick(appIdToCloseConfirm, { closeConfirmed: true });
  };

  const renderInstructionsModal = (appId) => {
    setCurrentApp(appId);
  };

  const handleActivateAppOnClick = (appId, options = {}) => {
    renderInstructionsModal(appId); // currently no event for this
    setProcessingApps({ ...processingApps, appId: true });
    // If URL is opened in browser instead of desktop app
    if (!window.RQ || !window.RQ.DESKTOP) return;

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("activate-app", {
      id: appId,
      options: { ...options },
    })
      .then((res) => {
        setProcessingApps({ ...processingApps, appId: false });

        // Notify user and update state
        if (res.success) {
          toast.success(`Connected ${getAppName(appId)}`);
          dispatch(
            actions.updateDesktopSpecificAppProperty({
              appId: appId,
              property: "isActive",
              value: true,
            })
          );
          trackAppConnectedEvent(getAppName(appId));
          // apps with instruction modals should not be force navigated
          if (!["system-wide", "existing-terminal"].includes(appId)) {
            redirectToTraffic(navigate);
          }
        } else if (res.metadata && res.metadata.closeConfirmRequired) {
          setAppIdToCloseConfirm(appId);
          setIsCloseConfirmModalActive(true);
        } else {
          toast.error(`Unable to activate ${getAppName(appId)}. Issue reported.`);
          trackAppConnectFailureEvent(getAppName(appId));
        }
      })
      .catch(Logger.log);
  };

  const handleDisconnectAppOnClick = (appId) => {
    setProcessingApps({ ...processingApps, appId: true });
    // If URL is opened in browser instead of dekstop app
    if (!window.RQ || !window.RQ.DESKTOP) return;

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("deactivate-app", {
      id: appId,
    })
      .then((res) => {
        setProcessingApps({ ...processingApps, appId: false });

        // Notify user and update state
        if (res.success) {
          toast.info(`Disconnected ${getAppName(appId)}`);

          dispatch(
            actions.updateDesktopSpecificAppProperty({
              appId: appId,
              property: "isActive",
              value: false,
            })
          );
          trackAppDisconnectedEvent(getAppName(appId));
        } else {
          toast.error(`Unable to deactivate ${getAppName(appId)}. Issue reported.`);
        }
      })
      .catch((err) => Logger.log(err));
  };

  const renderChangeAppStatusBtn = (appId, isScanned, isActive, isAvailable) => {
    if (!isAvailable) {
      return <span className="text-primary cursor-disabled">Couldn't find it on your system</span>;
    } else if (!isActive) {
      return (
        <Button
          type="secondary"
          icon={<ArrowRightOutlined />}
          onClick={() => handleActivateAppOnClick(appId)}
          loading={!isScanned || processingApps[appId]}
        >
          Open
        </Button>
      );
    } else {
      return (
        <Button
          danger
          type="link"
          icon={<PoweroffOutlined />}
          className="btn btn-danger btn-icon btn-3  has-no-box-shadow"
          onClick={() => handleDisconnectAppOnClick(appId)}
        >
          Close
        </Button>
      );
    }
  };

  const renderComingSoonBtn = (appName) => {
    return <span className="text-primary cursor-disabled">Support for {appName} is coming soon</span>;
  };

  const renderInstructionsActionButton = (app) => {
    return (
      <Button type="secondary" icon={<ArrowRightOutlined />} onClick={() => renderInstructionsModal(app.id)}>
        Open
      </Button>
    );
  };

  const renderSourceCardActionButton = (app) => {
    if (
      app.id === "android" ||
      app.id === "ios" ||
      (app.id === "existing-terminal" && isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY))
    ) {
      return renderInstructionsActionButton(app);
    }

    const button = app.comingSoon
      ? renderComingSoonBtn(app.name)
      : renderChangeAppStatusBtn(app.id, app.isScanned, app.isActive, app.isAvailable);

    return button;
  };

  const renderSourceCard = (app) => {
    return (
      <Card key={app.id} style={{ width: 270 }} actions={[<p>{renderSourceCardActionButton(app)}</p>]}>
        <Row>
          <Col flex="auto">
            <Meta
              avatar={<Avatar src={window.location.origin + "/assets/img/thirdPartyAppIcons/" + app.icon} />}
              title={app.name}
              description={app.description}
            />
          </Col>
          <Col>
            {app.isDocAvailable ? (
              <a href={app.isDocAvailable} rel="noreferrer" target="_blank">
                <InfoCircleOutlined />
              </a>
            ) : null}
          </Col>
        </Row>
      </Card>
    );
  };

  const renderSources = () => {
    return (
      <Collapse defaultActiveKey={["1"]}>
        <Panel header="Available" key="1">
          <Space align="start" wrap>
            {renderAvailableSources()}
          </Space>
        </Panel>
        <Panel header="Unavailable" key="2">
          <Space align="start" wrap>
            {renderUnavailableSources()}
          </Space>
        </Panel>
        <Panel header="Coming Soon" key="3">
          <Space align="start" wrap>
            {renderComingSoonSources()}
          </Space>
        </Panel>
      </Collapse>
    );
  };

  const renderAvailableSources = () => {
    // TODO @sahil: Remove this hack. Hack for now for Android
    const availableSources = appsListArray.filter(
      (app) =>
        (app.id === "ios" || !app.comingSoon) &&
        (app.isAvailable ||
          !app.isScanned ||
          app.id === "android" ||
          app.id === "ios" ||
          (app.id === "existing-terminal" && isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY)))
    );
    return availableSources.map((app) => {
      return renderSourceCard(app);
    });
  };

  const renderUnavailableSources = () => {
    const unavailableSources = appsListArray.filter(
      (app) =>
        !app.isAvailable &&
        !app.comingSoon &&
        app.id !== "android" &&
        app.id !== "ios" &&
        app.id !== "existing-terminal"
    );

    return unavailableSources.map((app) => {
      return renderSourceCard(app);
    });
  };

  const renderComingSoonSources = () => {
    const comingSoonSources = appsListArray.filter((app) => app.comingSoon && app.id !== "ios");

    return comingSoonSources.map((app) => {
      return renderSourceCard(app);
    });
  };

  return (
    <React.Fragment>
      {<InstructionsModal appId={currentApp} setCurrentApp={setCurrentApp} />}
      {/* <Row>
        <Col span={24} align="center">
          <p className="text-center lead">
            Connect your system apps to Requestly. After connecting the required
            app, click <Link to={APP_CONSTANTS.PATHS.RULES.RELATIVE}>here</Link>{" "}
            to setup Rules.
          </p>
        </Col>
      </Row>
      <br />
      <Row>
        <Col span={24} align="center">
          {renderSources()}
        </Col>
      </Row>
      <br />
      <Row>
        <Col span={24} align="center">
          <Typography.Title level={5}>
            Couldn't find required app? To manually set proxy and install
            certificate{" "}
            <Link to={APP_CONSTANTS.PATHS.DESKTOP.MANUAL_SETUP.RELATIVE}>
              <Button type="primary">Click Here</Button>
            </Link>{" "}
          </Typography.Title>
        </Col>
      </Row> */}
      <RQModal visible={true} wrapClassName="connected-apps-modal" centered>
        <Col className="contected-apps-modal-content">
          <Row className="white header text-bold">Connected apps</Row>
          <Row className="text-gray mt-8">
            Connect your system apps to Requestly. After connecting the required app, click here to setup rules.
          </Row>
        </Col>
        <Col className="rq-modal-footer">footer</Col>
      </RQModal>
      {/* Modals */}
      {isCloseConfirmModalActive ? (
        <CloseConfirmModal
          isOpen={isCloseConfirmModalActive}
          toggle={toggleCloseConfirmModal}
          action={handleCloseConfirmContinue}
        />
      ) : null}
    </React.Fragment>
  );
};

export default Sources;
