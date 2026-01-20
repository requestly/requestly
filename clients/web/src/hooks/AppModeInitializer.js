import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
// UTILS
import {
  getAppMode,
  getDesktopSpecificDetails,
  getHasConnectedApp,
  getUserPersonaSurveyDetails,
} from "../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
// ACTIONS
import { startBackgroundProcess, invokeAppDetectionInBackground } from "../actions/DesktopActions";
import {
  trackAppConnectedEvent,
  trackAppDetectedEvent,
  trackAppDisconnectedEvent,
} from "modules/analytics/events/desktopApp/apps";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAndUpdateInstallationDate, isDesktopMode } from "utils/Misc";
import firebaseApp from "firebase.js";
import { isExtensionInstalled, notifyAppLoadedToExtension } from "actions/ExtensionActions";
import {
  trackBackgroundProcessStartedEvent,
  trackDesktopAppStartedEvent,
  trackProxyReStartedEvent,
  trackProxyServerStartedEvent,
} from "modules/analytics/events/desktopApp";
import { getEventsEngineFlag, handleEventBatches } from "modules/analytics/events/extension";
import PSMH from "../config/PageScriptMessageHandler";
import { invokeSyncingIfRequired } from "./DbListenerInit/syncingNodeListener";
import { toast } from "utils/Toast";
import { trackDesktopBGEvent, trackDesktopMainEvent } from "modules/analytics/events/desktopApp/backgroundEvents";
import { useNavigate } from "react-router-dom";
import { useHasChanged } from "./useHasChanged";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { decompressEvents } from "views/features/sessions/SessionViewer/sessionEventsUtils";
import PATHS from "config/constants/sub/paths";
import { PreviewType, networkSessionActions } from "store/features/network-sessions/slice";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { trackHarFileOpened } from "modules/analytics/events/features/sessionRecording/networkSessions";
import { trackLocalSessionRecordingOpened } from "modules/analytics/events/features/sessionRecording";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { ApiClientImporterType } from "features/apiClient/types";
import { clientStorageService } from "services/clientStorageService";

let hasAppModeBeenSet = false;
/**
 * AppModeInitializer is a React component responsible for initializing and handling
 * side effects based on the current application mode (Desktop, Extension, etc.).
 *
 * It sets up background processes, message handlers, authentication listeners,
 * and navigation logic for different app modes. It also manages communication
 * with browser extensions and desktop services, and ensures that the application
 * state is correctly synchronized with user authentication and workspace context.
 *
 * This component does not render any UI and returns null.
 */

const AppModeInitializer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const { appsList, isBackgroundProcessActive, isProxyServerRunning } = useSelector(getDesktopSpecificDetails);
  const hasConnectedAppBefore = useSelector(getHasConnectedApp);
  const userPersona = useSelector(getUserPersonaSurveyDetails);

  const appsListRef = useRef(null);
  const hasMessageHandlersBeenSet = useRef(false);
  const hasAuthChanged = useHasChanged(user.loggedIn);

  const getAppName = useCallback((appId) => appsListRef.current[appId]?.name, []);

  useEffect(() => {
    appsListRef.current = appsList;
  }, [appsList]);

  useEffect(() => {
    // Setup Desktop App specific things here
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      if (!isBackgroundProcessActive) {
        // Start the bg process
        startBackgroundProcess().then((newStatus) => {
          dispatch(
            globalActions.updateDesktopSpecificDetails({
              isBackgroundProcessActive: !!newStatus,
            })
          );
          trackBackgroundProcessStartedEvent();
          if (newStatus === true) {
            //Start proxy server
            window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("start-proxy-server").then((res) => {
              const { success, port, proxyIp, helperServerPort } = res;
              dispatch(
                globalActions.updateDesktopSpecificDetails({
                  isProxyServerRunning: !!success,
                  proxyPort: port,
                  proxyIp: proxyIp,
                  helperServerPort,
                })
              );
              trackProxyServerStartedEvent();
              // Set handler for windows closed
              window.RQ.DESKTOP.SERVICES.IPC.registerEvent("browser-closed", (payload) => {
                dispatch(
                  globalActions.updateDesktopSpecificAppProperty({
                    appId: payload.appId,
                    property: "isActive",
                    value: false,
                  })
                );
                trackAppDisconnectedEvent(appsListRef.current[payload.appId]?.name);
              });
              // Set handler for activable sources
              window.RQ.DESKTOP.SERVICES.IPC.registerEvent("app-detected", (payload) => {
                dispatch(
                  globalActions.updateDesktopSpecificAppProperty({
                    appId: payload.id,
                    property: "isScanned",
                    value: true,
                  })
                );
                dispatch(
                  globalActions.updateDesktopSpecificAppProperty({
                    appId: payload.id,
                    property: "isAvailable",
                    value: payload.isAppActivatable,
                  })
                );

                if (payload.isAppActivatable) {
                  trackAppDetectedEvent(appsListRef.current[payload.id].name);
                }
              });
              // Get Active sources
              const appsListArray = Object.values(appsListRef.current);
              invokeAppDetectionInBackground(appsListArray);

              window.RQ.DESKTOP.SERVICES.IPC.registerEvent("proxy-restarted", (payload) => {
                const { port, proxyIp } = payload;
                dispatch(
                  globalActions.updateDesktopSpecificDetails({
                    proxyPort: port,
                    proxyIp: proxyIp,
                  })
                );
                trackProxyReStartedEvent();
              });

              window.RQ.DESKTOP.SERVICES.IPC.registerEvent("browser-connected", (payload) => {
                toast.success(`${getAppName(payload.appId)} profile connected`);
                dispatch(
                  globalActions.updateDesktopSpecificAppProperty({
                    appId: payload.appId,
                    property: "isActive",
                    value: true,
                    connectedExtensionClientId: payload.connectedExtensionClientId,
                  })
                );
                dispatch(
                  globalActions.updateDesktopSpecificAppProperty({
                    appId: payload.appId,
                    property: "connectedExtensionClientId",
                    value: payload.connectedExtensionClientId,
                  })
                );
                trackAppConnectedEvent(payload.appId);
              });

              window.RQ.DESKTOP.SERVICES.IPC.registerEvent("browser-disconnected", (payload) => {
                toast.info(`${getAppName(payload.appId)} profile disconnected`);
                dispatch(
                  globalActions.updateDesktopSpecificAppProperty({
                    appId: payload.appId,
                    property: "isActive",
                    value: false,
                    connectedExtensionClientId: null,
                  })
                );
                trackAppDisconnectedEvent(payload.appId);
              });
            });
          }
          window.RQ.DESKTOP.SERVICES.IPC.registerEvent("analytics-event", (payload) => {
            if (payload?.origin && payload?.origin === "main") {
              trackDesktopMainEvent(payload?.name, payload?.params);
            } else {
              // todo: need to setup relay for BG renderer events
              trackDesktopBGEvent(payload?.name, payload?.params);
            }
          });
          window.RQ.DESKTOP.SERVICES.IPC.registerEvent("helper-server-hit", () => {
            dispatch(
              globalActions.updateDesktopSpecificAppProperty({
                appId: "existing-terminal",
                property: "isActive",
                value: true,
              })
            );
            trackDesktopBGEvent("helper-server-hit");
          });
        });
      }
    }
  }, [appMode, isBackgroundProcessActive, dispatch, getAppName]);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("deeplink-handler", (payload) => {
        navigate(payload);
      });
      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("initiate-app-close", () => {
        navigate(PATHS.DESKTOP.QUIT.ABSOLUTE);
      });

      return () => {
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("deeplink-handler");
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("initiate-app-close");
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode]);

  const closeConnectedAppsModal = useCallback(
    (props = {}) => {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "connectedAppsModal",
          newValue: false,
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS)) {
      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("open-file", async (fileObj) => {
        if (fileObj?.extension === ".rqly" || fileObj?.extension === ".har") {
          let fileData;
          try {
            fileData = JSON.parse(fileObj?.contents);
          } catch (error) {
            console.error("could not parse the user's file to json");
            toast.error("Error loading file");
            return;
          }

          // close connect app modal that opens on launch
          closeConnectedAppsModal();

          if (fileObj?.extension === ".rqly") {
            dispatch(sessionRecordingActions.setSessionRecordingMetadata({ ...fileData?.data?.metadata }));
            const recordedSessionEvents = decompressEvents(fileData?.data?.events);
            dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
            trackLocalSessionRecordingOpened();
            navigate(`${PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.ABSOLUTE}/imported`);
          } else if (fileObj?.extension === ".har") {
            dispatch(networkSessionActions.resetState());
            dispatch(networkSessionActions.setImportedHar(fileData));
            dispatch(networkSessionActions.setPreviewType(PreviewType.IMPORTED));
            dispatch(networkSessionActions.setSessionName(fileObj.name));
            trackHarFileOpened();
            redirectToNetworkSession(navigate, undefined, false);
          }
        } else {
          console.log("unknown file type detected");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      trackDesktopAppStartedEvent();
    }
  }, [appMode]);

  useEffect(() => {
    if (
      isProxyServerRunning &&
      appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      !hasConnectedAppBefore &&
      userPersona?.isSurveyCompleted
    ) {
      dispatch(globalActions.toggleActiveModal({ modalName: "connectedAppsModal" }));
    }
  }, [appMode, dispatch, hasConnectedAppBefore, isProxyServerRunning, userPersona?.isSurveyCompleted]);

  // Set app mode to "DESKTOP" if required. Default is "EXTENSION"
  useEffect(() => {
    const asyncUseEffect = async () => {
      if (!hasAppModeBeenSet || hasAuthChanged) {
        hasAppModeBeenSet = true;
        if (!isExtensionInstalled()) {
          if (isDesktopMode()) {
            dispatch(
              globalActions.updateAppMode({
                appMode: GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
              })
            );
          }
        } else {
          if (appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
            // Fallback to default value
            dispatch(
              globalActions.updateAppMode({
                appMode: GLOBAL_CONSTANTS.APP_MODES.EXTENSION,
              })
            );
          }
        }
      }
    };

    asyncUseEffect();
  }, [appMode, dispatch, hasAuthChanged, user?.details?.profile?.uid, user?.loggedIn]);

  // Things that need 100% valid "appMode"
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      if (hasAppModeBeenSet) {
        // Attributes
        getAndUpdateInstallationDate(appMode, true, !!user);
      }
    });
  }, [appMode]);

  useEffect(() => {
    // This useEffect should not get invoked multiple times
    if (hasMessageHandlersBeenSet.current) return;
    hasMessageHandlersBeenSet.current = true;

    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      clientStorageService.saveStorageObject(getEventsEngineFlag).then(() => notifyAppLoadedToExtension());

      PSMH.addMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS, (message) => {
        const batchIdsToAcknowledge = handleEventBatches(message.eventBatches);
        return {
          ackIds: batchIdsToAcknowledge,
          received: true,
        };
      });

      PSMH.addMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED, (_message) => {
        window.skipSyncListenerForNextOneTime = false;
        toast.loading("Just a sec, fetching updated rules..", 2, true);
        invokeSyncingIfRequired({
          dispatch,
          uid: user?.details?.profile?.uid,
          team_id: activeWorkspaceId,
          appMode,
          isSyncEnabled: user?.details?.isSyncEnabled,
        });

        return {
          received: true,
        };
      });

      PSMH.addMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.OPEN_CURL_IMPORT_MODAL, (message) => {
        const { payload } = message;

        // Navigate to API Client with cURL import modal state
        const navigationState = {
          modal: ApiClientImporterType.CURL,
          curlCommand: payload.curlCommand,
          pageURL: payload.pageURL,
          source: payload.source,
        };

        navigate(PATHS.API_CLIENT.ABSOLUTE, { state: navigationState });

        return {
          received: true,
        };
      });
    }
  }, [appMode, activeWorkspaceId, dispatch, user?.details?.isSyncEnabled, user?.details?.profile?.uid, navigate]);

  return null;
};

export default AppModeInitializer;
