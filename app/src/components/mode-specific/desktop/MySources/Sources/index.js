import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Avatar, Tabs, Alert, Button } from "antd";
import { QuestionCircleOutlined, CheckCircleOutlined, DesktopOutlined, InfoCircleFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "utils/Toast.js";
// SUB COMPONENTS
import CloseConfirmModal from "./ErrorHandling/CloseConfirmModal";
import { RQButton, RQModal } from "lib/design-system/components";
// CONSTANTS
import { globalActions } from "store/slices/global/slice";
// UTILS
import { getDesktopSpecificAppDetails, getDesktopSpecificDetails } from "../../../../../store/selectors";
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
  trackFailedToConnectToSimulator,
} from "modules/analytics/events/desktopApp/apps";
import { redirectToTraffic } from "utils/RedirectionUtils";
import Logger from "lib/logger";
import "./index.css";
import TroubleshootLink from "./InstructionsModal/common/InstructionsTroubleshootButton";
import PATHS from "config/constants/sub/paths";
import { getConnectedAppsCount } from "utils/Misc";
import { trackConnectAppsCategorySwitched } from "modules/analytics/events/desktopApp/apps";
import LaunchButtonDropdown from "./LaunchButtonDropDown";
import { getAndroidDevices, getIosSimulators } from "./deviceFetchers";
import { IoMdRefresh } from "@react-icons/all-files/io/IoMdRefresh";
import IosBtn from "./iosBtn";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getUserOS } from "utils/osUtils";

const Sources = ({ isOpen, toggle, ...props }) => {
  const navigate = useNavigate();

  // Global State
  const dispatch = useDispatch();
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const iosAppDetails = useSelector((state) => getDesktopSpecificAppDetails(state, "ios-simulator"));

  // Component State
  const [processingApps, setProcessingApps] = useState({});
  const [isCloseConfirmModalActive, setIsCloseConfirmModalActive] = useState(false);
  const [appIdToCloseConfirm, setAppIdToCloseConfirm] = useState(false);
  const [appsListArray, setAppsListArray] = useState([]);
  const [showInstructions, setShowInstructions] = useState(props.showInstructions ?? false);
  const [activeSourceTab, setActiveSourceTab] = useState("browser");
  const [currentApp, setCurrentApp] = useState(props.appId ?? null);
  const [fetchingDevices, setFetchingDevices] = useState(false);
  const [fetchedDevicesOnce, setFetchedDevicesOnce] = useState(false);

  const { appsList } = desktopSpecificDetails;
  const systemWideSource = appsList["system-wide"];
  const appsListRef = useRef(null);
  const platformsForSystemWideProxy = useFeatureValue("show_systemwide_source", {
    whitelist: ["Windows"],
  });

  const isSystemWideSourceVisible = platformsForSystemWideProxy.whitelist?.includes(getUserOS());

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

  const fetchAndUpdateAndroidDevices = useCallback(() => {
    getAndroidDevices().then((devices) => {
      if (devices) {
        console.log("Devices", devices, desktopSpecificDetails.appsList);
        const updatedAppsList = { ...desktopSpecificDetails.appsList };
        devices.forEach((device) => {
          if (!desktopSpecificDetails.appsList[device.id]) {
            console.log("Adding Device", device);
            updatedAppsList[device.id] = {
              id: "android-adb",
              type: "mobile",
              name: device.id,
              description: device?.product,
              icon: "/assets/media/components/android.png",
              isActive: false,
              isScanned: true,
              comingSoon: false,
              isAvailable: true,
              metadata: { deviceId: device.id },
            };
          }
        });
        console.log("Updated Apps List", updatedAppsList);
        dispatch(globalActions.updateDesktopAppsList({ appsList: updatedAppsList }));
      }
      setFetchingDevices(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setProcessingApps({ ...processingApps, [appId]: true });
      // If URL is opened in browser instead of desktop app
      if (!window.RQ || !window.RQ.DESKTOP) return;

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("activate-app", {
        id: appId,
        options: { ...options },
      })
        .then((res) => {
          setProcessingApps({ ...processingApps, [appId]: false });

          // Notify user and update state
          console.log("App Activated Successfully", { res });
          if (res.success) {
            if (appId === "android-adb") {
              res?.metadata?.message
                ? toast.success(`Connected to ${options.deviceId}.\n${res?.metadata?.message}`, 10)
                : toast.success(`Connected to ${options.deviceId}`, 10);
              console.log(appId, options.deviceId, options.launchOptions);
              dispatch(
                globalActions.updateDesktopSpecificAppProperty({
                  appId: options.deviceId,
                  property: "isActive",
                  value: true,
                })
              );
            } else if (appId === "ios-simulator") {
              toast.success(`iOS simulator(s) connected successfully`);
              dispatch(
                globalActions.updateDesktopSpecificAppProperty({
                  appId: appId,
                  property: "isActive",
                  value: true,
                })
              );
            } else {
              toast.success(`Connected ${getAppName(appId)}`);
              dispatch(
                globalActions.updateDesktopSpecificAppProperty({
                  appId: appId,
                  property: "isActive",
                  value: true,
                })
              );
            }

            dispatch(globalActions.updateHasConnectedApp(true));
            trackAppConnectedEvent(getAppName(appId), getAppCount() + 1, getAppType(appId), options?.launchOptions);
            toggle();

            // navigate to traffic table
            redirectToTraffic(navigate);
          } else if (res.metadata && res.metadata.closeConfirmRequired) {
            setAppIdToCloseConfirm(appId);
            setIsCloseConfirmModalActive(true);
          } else {
            if (appId === "android-adb") {
              toast.error(`Unable to connect to ${options.deviceId}.\nError: ${res?.metadata?.message}`);
            } else {
              toast.error(`Unable to activate ${getAppName(appId)}. Issue reported.`);
            }

            trackAppConnectFailureEvent(getAppName(appId));

            if (appId === "system-wide") {
              renderInstructionsModal("system-wide");
            }
          }
        })
        .catch((err) => {
          if (appId === "ios-simulator") {
            trackFailedToConnectToSimulator();
            toast.error(`Error connecting to simulators. Please re-scan list of devices and try again.`);
          }
          Logger.log(err);
        });
    },
    [dispatch, getAppCount, navigate, processingApps, renderInstructionsModal, toggle]
  );

  const handleDisconnectAppOnClick = useCallback(
    (appId, options = {}) => {
      setProcessingApps({ ...processingApps, [appId]: true });
      // If URL is opened in browser instead of dekstop app
      if (!window.RQ || !window.RQ.DESKTOP) return;

      if (appId.includes("existing") && appsListRef.current[appId]?.connectedExtensionClientId) {
        window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("disconnect-extension", {
          appId,
          clientId: appsListRef.current[appId]?.connectedExtensionClientId,
        }).then(() => {
          setProcessingApps({ ...processingApps, [appId]: false });
        });
        return;
      }

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("deactivate-app", {
        id: appId,
        options,
      })
        .then((res) => {
          setProcessingApps({ ...processingApps, [appId]: false });

          // Notify user and update state
          if (res.success) {
            if (appId === "android-adb") {
              toast.info(`Disconnected ${options.deviceId}`);
              console.log(appId, options.deviceId, options.launchOptions);
              dispatch(
                globalActions.updateDesktopSpecificAppProperty({
                  appId: options.deviceId,
                  property: "isActive",
                  value: false,
                })
              );
            } else {
              toast.info(`Disconnected ${getAppName(appId)}`);
              dispatch(
                globalActions.updateDesktopSpecificAppProperty({
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

  const fetchAndUpdateIosDevices = useCallback(
    async (shouldShowPopup) => {
      if (!isFeatureCompatible(FEATURES.DESKTOP_IOS_SIMULATOR_SUPPORT)) return;
      let deviceCount = 0;
      let newIosDetails = { ...iosAppDetails };
      getIosSimulators()
        .then((simulators) => {
          const simulatorsFound =
            simulators && simulators?.activeDevices && Object.keys(simulators.activeDevices).length > 0;
          if (simulatorsFound) {
            deviceCount += Object.keys(simulators.activeDevices).length;
            newIosDetails = {
              ...newIosDetails,
              metadata: {
                devices: simulators.activeDevices ?? {},
              },
              type: "mobile", // "hack to make it visible"
            };
          } else {
            if (newIosDetails.isActive) {
              handleDisconnectAppOnClick("ios-simulator");
            }
            newIosDetails = {
              ...newIosDetails,
              metadata: {
                devices: {},
              },
              isActive: false,
              type: "hack to not show the option in the app manager",
            };
          }
        })
        .finally(() => {
          dispatch(
            globalActions.updateDesktopSpecificAppDetails({ appId: "ios-simulator", appDetails: newIosDetails })
          );
          setFetchingDevices(false);
          if (shouldShowPopup) {
            if (deviceCount === 0) {
              toast.warn("No simulators found. Please boot an ios simulator and scan again.");
            } else {
              if (deviceCount === 1) {
                toast.info(`Found 1 simulator`);
              } else {
                toast.info(`${deviceCount} simulators found`);
              }
            }
          }
        });
    },
    [iosAppDetails, handleDisconnectAppOnClick, dispatch]
  );

  const fetchAndUpdateDevices = useCallback(
    async (showPopup = true) => {
      setFetchingDevices(true);
      fetchAndUpdateAndroidDevices(showPopup);
      fetchAndUpdateIosDevices(showPopup);
    },
    [fetchAndUpdateAndroidDevices, fetchAndUpdateIosDevices]
  );

  useEffect(() => {
    if (!fetchedDevicesOnce) {
      fetchAndUpdateDevices(false);
      setFetchedDevicesOnce(true);
    }
  }, [fetchAndUpdateDevices, fetchedDevicesOnce]);

  const renderChangeAppStatusBtn = useCallback(
    (appId, isScanned, isActive, isAvailable, canLaunchWithCustomArgs, options = {}) => {
      if (!isAvailable && !isActive) {
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
            onClick={() => {
              if (appId.includes("existing") && isFeatureCompatible(FEATURES.CONNECT_EXTENSION)) {
                renderInstructionsModal(appId);
                return;
              }
              handleActivateAppOnClick(appId, options);
            }}
            loading={!isScanned || processingApps[appId]}
            className="launch-button"
          >
            {appId === "android-adb" ? "Connect" : appId.includes("existing") ? "Open" : "Launch"}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Col span={20} className="source-description">
            {app.description}
          </Col>
          <>
            {app.id === "ios-simulator" ? (
              <IosBtn handleActivate={handleActivateAppOnClick} handleDeactivate={handleDisconnectAppOnClick} />
            ) : app.type !== "browser" && app.id !== "android-adb" ? (
              <RQButton type="default" onClick={() => renderInstructionsModal(app.id)} className="mobile-connect-btn">
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
                  app.metadata ?? {}
                )}
              </>
            )}
          </>
        </Row>
      );
    },
    [handleActivateAppOnClick, handleDisconnectAppOnClick, renderChangeAppStatusBtn, renderInstructionsModal]
  );

  const renderSources = useCallback(
    (type) => {
      const sources = appsListArray.filter((app) => type === app.type);
      const renderSourceByType = {
        browser: (source) => (source.isAvailable || source.isActive ? renderSourceCard(source) : null),
        mobile: (source) => renderSourceCard(source),
        terminal: (source) =>
          isFeatureCompatible(FEATURES.DESKTOP_APP_TERMINAL_PROXY) ? renderSourceCard(source) : null,
        other: (source) => renderSourceCard(source),
      };

      return (
        <>
          {type === "mobile" && isFeatureCompatible(FEATURES.DESKTOP_ANDROID_EMULATOR_SUPPORT) ? (
            <>
              <Alert
                message={
                  <Row justify={"space-between"}>
                    <Col style={{ paddingTop: "4px" }}>Not seeing your emulator/device!!</Col>
                    <Col>
                      <Button
                        type="link"
                        onClick={() => {
                          window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
                            link: "https://docs.requestly.com/general/http-interceptor/android-simulator-interception",
                          });
                        }}
                        icon={<InfoCircleFilled />}
                      >
                        Need Help
                      </Button>
                      <Button icon={<IoMdRefresh />} disabled={fetchingDevices} onClick={fetchAndUpdateDevices}>
                        &nbsp;Refresh Devices
                      </Button>
                      {/* <Button danger>Disconnect All</Button> */}
                    </Col>
                  </Row>
                }
                type="info"
                banner={true}
                style={{ width: "100%" }}
              />

              <br />
            </>
          ) : null}
          <Row>
            <div className="source-grid">{sources.map((source) => renderSourceByType[source.type](source))}</div>
          </Row>
        </>
      );
    },
    [appsListArray, renderSourceCard, fetchAndUpdateDevices, fetchingDevices]
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
      {
        key: "other",
        label: `Others`,
        children: renderSources("other"),
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
            <SetupInstructions
              appId={currentApp}
              setShowInstructions={setShowInstructions}
              handleActivateAppOnClick={handleActivateAppOnClick}
            />
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
        ) : systemWideSource.isAvailable && isSystemWideSourceVisible ? (
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
