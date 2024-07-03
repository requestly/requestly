import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Avatar, Tabs } from "antd";
import { QuestionCircleOutlined, CheckCircleOutlined, DesktopOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "utils/Toast.js";
// SUB COMPONENTS
import CloseConfirmModal from "./ErrorHandling/CloseConfirmModal";
import { RQButton, RQModal } from "lib/design-system/components";
// CONSTANTS
import { actions } from "../../../../../store";
// UTILS
import { getDesktopSpecificDetails } from "../../../../../store/selectors";
import SetupInstructions from "./InstructionsModal";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import {
  trackAppConnectedEvent,
  trackAppDisconnectedEvent,
  trackAppConnectFailureEvent,
  trackSystemWideConnected,
  trackAppSetupInstructionsViewed,
  trackConnectAppsModalClosed,
  trackConnectAppsViewed,
} from "modules/analytics/events/desktopApp/apps";
import { redirectToTraffic } from "utils/RedirectionUtils";
import Logger from "lib/logger";
import "./index.css";
import { trackTrafficInterceptionStarted } from "modules/analytics/events/desktopApp";
import TroubleshootLink from "./InstructionsModal/common/InstructionsTroubleshootButton";
import PATHS from "config/constants/sub/paths";
import { getConnectedAppsCount } from "utils/Misc";
import { trackConnectAppsCategorySwitched } from "modules/analytics/events/desktopApp/apps";
import LaunchButtonDropdown from "./LaunchButtonDropDown";
import { getAndroidDevices } from "./utils";

const Sources = ({ isOpen, toggle, ...props }) => {
  const navigate = useNavigate();

  // Global State
  const dispatch = useDispatch();
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  // Component State
  const [processingApps, setProcessingApps] = useState({});
  const [isCloseConfirmModalActive, setIsCloseConfirmModalActive] = useState(false);
  const [appIdToCloseConfirm, setAppIdToCloseConfirm] = useState(false);
  const [appsListArray, setAppsListArray] = useState([]);
  const [showInstructions, setShowInstructions] = useState(props.showInstructions ?? false);
  const [activeSourceTab, setActiveSourceTab] = useState("browser");
  const [currentApp, setCurrentApp] = useState(props.appId ?? null);

  const { appsList } = desktopSpecificDetails;
  const systemWideSource = appsList["system-wide"];
  const appsListRef = useRef(null);

  const getAppName = (appId) => appsListRef.current[appId]?.name;
  const getAppCount = useCallback(() => getConnectedAppsCount(appsListArray), [appsListArray]);
  const getAppType = (appId) => appsListRef.current[appId]?.type;

  useEffect(() => {
    trackConnectAppsViewed(props.source);
  }, [props.source]);

  useEffect(() => {
    appsListRef.current = appsList;
    setAppsListArray(Object.values(appsList));
  }, [appsList]);

  useEffect(() => {
    getAndroidDevices().then((devices) => {
      if (devices) {
        console.log("Devices", devices, desktopSpecificDetails.appsList);
        const updatedAppsList = { ...desktopSpecificDetails.appsList };
        devices.forEach((device) => {
          if (!desktopSpecificDetails.appsList[device.id]) {
            console.log("Adding Device", device.id);
            updatedAppsList[device.id] = {
              id: "android",
              type: "mobile-auto",
              name: device.id,
              description: device?.details?.model,
              icon: "android.png",
              isActive: false,
              isScanned: true,
              comingSoon: false,
              isAvailable: true,
            };
          }
        });
        console.log("Updated Apps List", updatedAppsList);
        dispatch(actions.updateDesktopAppsList({ appsList: updatedAppsList }));
      }
    });
  }, [dispatch]); // Don't add appsList as dependency

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

  const renderInstructionsModal = useCallback(
    (appId) => {
      setCurrentApp(appId);
      setShowInstructions(true);
      trackAppSetupInstructionsViewed(getAppName(appId), getAppCount() + 1);
    },
    [getAppCount]
  );

  const handleActivateAppOnClick = useCallback(
    (appId, options = {}) => {
      // renderInstructionsModal(appId); // currently no event for this
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
            if (appId === "android") {
              console.log(appId, options.deviceId, options.launchOptions);
              dispatch(
                actions.updateDesktopSpecificAppProperty({
                  appId: options.deviceId,
                  property: "isActive",
                  value: true,
                })
              );
            } else {
              dispatch(
                actions.updateDesktopSpecificAppProperty({
                  appId: appId,
                  property: "isActive",
                  value: true,
                })
              );
            }

            dispatch(actions.updateHasConnectedApp(true));
            trackAppConnectedEvent(getAppName(appId), getAppCount() + 1, getAppType(appId), options?.launchOptions);
            toggle();

            // navigate to traffic table
            redirectToTraffic(navigate);
            trackTrafficInterceptionStarted(getAppName(appId));
          } else if (res.metadata && res.metadata.closeConfirmRequired) {
            setAppIdToCloseConfirm(appId);
            setIsCloseConfirmModalActive(true);
          } else {
            toast.error(`Unable to activate ${getAppName(appId)}. Issue reported.`);
            trackAppConnectFailureEvent(getAppName(appId));

            if (appId === "system-wide") {
              renderInstructionsModal("system-wide");
            }
          }
        })
        .catch(Logger.log);
    },
    [dispatch, getAppCount, navigate, processingApps, renderInstructionsModal, toggle]
  );

  const handleDisconnectAppOnClick = useCallback(
    (appId, options = {}) => {
      setProcessingApps({ ...processingApps, appId: true });
      // If URL is opened in browser instead of dekstop app
      if (!window.RQ || !window.RQ.DESKTOP) return;

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("deactivate-app", {
        id: appId,
        options,
      })
        .then((res) => {
          setProcessingApps({ ...processingApps, appId: false });

          // Notify user and update state
          if (res.success) {
            toast.info(`Disconnected ${getAppName(appId)}`);

            if (appId === "android") {
              console.log(appId, options.deviceId, options.launchOptions);
              dispatch(
                actions.updateDesktopSpecificAppProperty({
                  appId: options.deviceId,
                  property: "isActive",
                  value: false,
                })
              );
            } else {
              dispatch(
                actions.updateDesktopSpecificAppProperty({
                  appId: appId,
                  property: "isActive",
                  value: false,
                })
              );
            }
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
    (appId, isScanned, isActive, isAvailable, canLaunchWithCustomArgs, options = {}) => {
      if (!isAvailable) {
        return <span className="text-primary cursor-disabled">Couldn't find it on your system</span>;
      } else if (!isActive) {
        return isFeatureCompatible(FEATURES.CUSTOM_LAUNCH_OPTIONS) && canLaunchWithCustomArgs ? (
          <LaunchButtonDropdown
            appId={appId}
            isScanned={isScanned}
            isAvailable={isAvailable}
            onActivateAppClick={handleActivateAppOnClick}
          />
        ) : (
          <RQButton
            type="default"
            onClick={() => handleActivateAppOnClick(appId, options)}
            loading={!isScanned || processingApps[appId]}
            className="launch-button"
          >
            {appId.includes("existing") ? "Open" : "Launch"}
          </RQButton>
        );
      } else {
        return (
          <RQButton
            danger
            type="default"
            className="danger-btn"
            onClick={() => handleDisconnectAppOnClick(appId, options)}
          >
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
            {app.type !== "browser" && app.type !== "mobile-auto" ? (
              <RQButton type="default" onClick={() => renderInstructionsModal(app.id)}>
                Setup Instructions
              </RQButton>
            ) : (
              <>
                {renderChangeAppStatusBtn(
                  app.id,
                  app.isScanned,
                  app.isActive,
                  app.isAvailable,
                  app.canLaunchWithCustomArgs,
                  app.type === "mobile-auto" ? { deviceId: app.name } : {}
                )}
              </>
            )}
          </>
        </Row>
      );
    },
    [renderChangeAppStatusBtn, renderInstructionsModal]
  );

  // const renderMobileSources = useCallback(
  //   (source) => {
  //     fetchMobileDevices();
  //     const manualSetupSources = [
  //       {
  //         id: "android",
  //         type: "mobile",
  //         name: "Android",
  //         description: "External Device",
  //         icon: "android.png",
  //         isActive: false,
  //         isScanned: false,
  //         comingSoon: false,
  //         isAvailable: true,
  //       },
  //       {
  //         id: "ios",
  //         type: "mobile",
  //         name: "iOS",
  //         description: "External Device",
  //         icon: "ios.svg",
  //         isActive: false,
  //         isScanned: false,
  //         comingSoon: false,
  //         isAvailable: true,
  //       },
  //     ];

  //     return (
  //       <div className="source-grid">
  //         {mobileDevices?.map((device) => {
  //           return renderSourceCard({
  //             id: "android",
  //             type: "mobile-auto",
  //             name: device.id,
  //             description: device?.details?.model,
  //             icon: "android.png",
  //             isActive: false,
  //             isScanned: true,
  //             comingSoon: false,
  //             isAvailable: true,
  //           });
  //         })}
  //         {manualSetupSources.map((source) => renderSourceCard(source))}
  //       </div>
  //     );
  //   },
  //   [fetchMobileDevices, mobileDevices, renderSourceCard]
  // );

  const renderSources = useCallback(
    (types) => {
      const sources = appsListArray.filter((app) => types.includes(app.type));
      const renderSourceByType = {
        browser: (source) => (source.isAvailable ? renderSourceCard(source) : null),
        mobile: (source) => renderSourceCard(source),
        "mobile-auto": (source) => renderSourceCard(source),
        terminal: (source) =>
          isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY) ? renderSourceCard(source) : null,
        other: (source) => renderSourceCard(source),
      };

      return <div className="source-grid">{sources.map((source) => renderSourceByType[source.type](source))}</div>;
    },
    [appsListArray, renderSourceCard]
  );

  const sourceTabs = useMemo(
    () => [
      {
        key: "browser",
        label: `Installed browsers`,
        children: renderSources(["browser"]),
      },
      {
        key: "mobile",
        label: `Mobile apps & browsers`,
        children: renderSources(["mobile", "mobile-auto"]),
      },
      {
        key: "terminal",
        label: `Terminal processes`,
        disabled: !isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY),
        children: renderSources(["terminal"]),
      },
      {
        key: "other",
        label: `Others`,
        children: renderSources(["other"]),
      },
    ],
    [renderSources]
  );

  const renderInterceptSystemWideSourceToggle = useCallback(() => {
    return (
      <>
        {systemWideSource.isActive ? (
          <>
            <CheckCircleOutlined className="system-wide-check-icon" />
            Requestly everywhere enabled to inspect all traffic from this device.
            <RQButton
              type="default"
              className="danger-btn"
              onClick={() => handleDisconnectAppOnClick(systemWideSource.id)}
            >
              Disconnect
            </RQButton>
          </>
        ) : (
          <>
            <QuestionCircleOutlined /> Want to capture requests from all your apps across this device?
            <RQButton
              type="default"
              icon={<DesktopOutlined />}
              onClick={() => {
                handleActivateAppOnClick(systemWideSource.id);
                trackSystemWideConnected("app_source_modal");
              }}
            >
              Enable Requestly system-wide
            </RQButton>
          </>
        )}
      </>
    );
  }, [systemWideSource.isActive, systemWideSource.id, handleActivateAppOnClick, handleDisconnectAppOnClick]);

  return (
    <React.Fragment>
      <RQModal
        width={900}
        open={isOpen}
        wrapClassName="connected-apps-modal"
        centered
        maskClosable={!showInstructions}
        closable={!showInstructions}
        onCancel={() => {
          toggle();
          trackConnectAppsModalClosed(getAppCount());
        }}
        destroyOnClose
      >
        <Col className="connected-apps-modal-content">
          {showInstructions ? (
            <SetupInstructions appId={currentApp} setShowInstructions={setShowInstructions} />
          ) : (
            <>
              <Row className="white header text-bold">Connect apps</Row>
              <Row className="text-gray mt-8">
                Connect your system apps to Requestly. After connecting the required app, click&nbsp;
                <Link to={PATHS.RULES.RELATIVE} className="connected-apps-secondary-link" onClick={toggle}>
                  here
                </Link>
                &nbsp;to setup rules.
              </Row>
              <Row className="w-full mt-20">
                <Tabs
                  className="source-tabs-container"
                  activeKey={activeSourceTab}
                  onChange={(key) => {
                    setActiveSourceTab(key);
                    trackConnectAppsCategorySwitched(key);
                  }}
                  items={sourceTabs}
                />
              </Row>
            </>
          )}
        </Col>
        {showInstructions ? (
          <Col className="rq-modal-footer instruction-footer">
            <TroubleshootLink appId={currentApp} />
            <RQButton
              type="primary"
              className="text-bold"
              onClick={() => {
                toggle();
                redirectToTraffic(navigate);
              }}
            >
              Intercept traffic
            </RQButton>
          </Col>
        ) : systemWideSource.isAvailable ? (
          <Col className="rq-modal-footer system-wide-source text-gray">{renderInterceptSystemWideSourceToggle()}</Col>
        ) : null}
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
