import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Space, Card, Avatar, Button, Typography, Collapse, Tabs } from "antd";
import { InfoCircleOutlined, QuestionCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "utils/Toast.js";
// SUB COMPONENTS
import CloseConfirmModal from "./ErrorHandling/CloseConfirmModal";
import { RQButton, RQModal } from "lib/design-system/components";
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

const Sources = ({ isOpen, toggle }) => {
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
  console.log(desktopSpecificDetails);

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

  const handleActivateAppOnClick = useCallback(
    (appId, options = {}) => {
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
    },
    [dispatch, navigate, processingApps]
  );

  const handleDisconnectAppOnClick = useCallback(
    (appId) => {
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
    },
    [dispatch, processingApps]
  );

  const renderChangeAppStatusBtn = useCallback(
    (appId, isScanned, isActive, isAvailable) => {
      if (!isAvailable) {
        return <span className="text-primary cursor-disabled">Couldn't find it on your system</span>;
      } else if (!isActive) {
        return (
          <RQButton
            type="default"
            onClick={() => handleActivateAppOnClick(appId)}
            loading={!isScanned || processingApps[appId]}
          >
            Launch
          </RQButton>
        );
      } else {
        return (
          <RQButton danger type="default" className="danger-btn" onClick={() => handleDisconnectAppOnClick(appId)}>
            Disconnect
          </RQButton>
        );
      }
    },
    [processingApps, handleActivateAppOnClick, handleDisconnectAppOnClick]
  );

  const renderSourceCard = useCallback(
    (app) => {
      return (
        <Row className="source-item" key={app.id}>
          <Col className="source-item-meta">
            <Avatar src={window.location.origin + "/assets/img/thirdPartyAppIcons/" + app.icon} />
            <Row className="text-bold">{app.name}</Row>
          </Col>
          <Col className="source-description">{app.description}</Col>
          <>
            {app.id === "android" || app.id === "ios" || app.id === "existing-terminal" ? (
              <RQButton type="default" onClick={() => renderInstructionsModal(app.id)}>
                Setup Instructions
              </RQButton>
            ) : (
              <>{renderChangeAppStatusBtn(app.id, app.isScanned, app.isActive, app.isAvailable)}</>
            )}
          </>
        </Row>
      );
    },
    [renderChangeAppStatusBtn]
  );

  const renderSources = useCallback(
    (type) => {
      const sources = appsListArray.filter((app) => app.type === type);
      const renderSourceByType = {
        browser: (source) => (source.isAvailable ? renderSourceCard(source) : null),
        mobile: (source) => renderSourceCard(source),
        terminal: (source) =>
          isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY) ? renderSourceCard(source) : null,
        other: (source) => (source.isAvailable ? renderSourceCard(source) : null),
      };

      return <div className="source-grid">{sources.map((source) => renderSourceByType[type](source))}</div>;
    },
    [appsListArray, renderSourceCard]
  );

  const sourceTabs = useMemo(
    () => [
      {
        key: "browser",
        label: `Installed browsers`,
        children: renderSources("browser"),
      },
      {
        key: "mobile",
        label: `Mobile apps & browsers`,
        children: renderSources("mobile"),
      },
      {
        key: "terminal",
        label: `Terminal processes`,
        disabled: !isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY),
        children: renderSources("terminal"),
      },
      // Hide others tab for now (only showing sources that are available)
      // {
      //   key: "other",
      //   label: `Others`,
      //   children: renderSources("other"),
      // },
    ],
    [renderSources]
  );

  const renderInterceptSystemWideSourceToggle = () => {
    const source = desktopSpecificDetails.appsList["system-wide"];

    return (
      <>
        {source.isActive ? (
          <>
            <CheckCircleOutlined style={{ color: "#069D4F" }} />
            Requestly everywhere enabled to inspect all traffic from this device.
            <RQButton type="default" className="danger-btn" onClick={() => handleDisconnectAppOnClick(source.id)}>
              Disconnect
            </RQButton>
          </>
        ) : (
          <>
            <QuestionCircleOutlined /> Want to capture requests from all your apps across this device?
            <RQButton
              type="default"
              icon={<CheckCircleOutlined style={{ color: "#069D4F" }} />}
              onClick={() => handleActivateAppOnClick(source.id)}
            >
              Enable Requestly system-wide
            </RQButton>
          </>
        )}
      </>
    );
  };

  return (
    <React.Fragment>
      {<InstructionsModal appId={currentApp} setCurrentApp={setCurrentApp} />}
      <RQModal
        width={900}
        open={isOpen}
        wrapClassName="connected-apps-modal"
        centered
        maskClosable={true}
        onCancel={toggle}
      >
        <Col className="contected-apps-modal-content">
          <Row className="white header text-bold">Connected apps</Row>
          <Row className="text-gray mt-8">
            Connect your system apps to Requestly. After connecting the required app, click here to setup rules.
          </Row>
          <Row className="w-full mt-20">
            <Tabs className="source-tabs-container" defaultActiveKey="browser" items={sourceTabs} />
          </Row>
        </Col>
        <Col className="rq-modal-footer system-wide-source text-gray">{renderInterceptSystemWideSourceToggle()}</Col>
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
