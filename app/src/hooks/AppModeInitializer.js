import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../store";
// UTILS
import { getAppMode, getDesktopSpecificDetails, getHasConnectedApp, getUserAuthDetails } from "../store/selectors";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// ACTIONS
import { startBackgroundProcess, invokeAppDetectionInBackground } from "../actions/DesktopActions";
import { trackAppDetectedEvent, trackAppDisconnectedEvent } from "modules/analytics/events/desktopApp/apps";
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
import { StorageService } from "init";
import { getEventsEngineFlag, handleEventBatches } from "modules/analytics/events/extension";
import PSMH from "../config/PageScriptMessageHandler";
import { invokeSyncingIfRequired } from "./DbListenerInit/syncingNodeListener";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { trackDesktopBGEvent, trackDesktopMainEvent } from "modules/analytics/events/desktopApp/backgroundEvents";
import { useNavigate } from "react-router-dom";

let hasAppModeBeenSet = false;

const AppModeInitializer = () => {
  const navigate = useNavigate();
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };
  const useHasChanged = (val) => {
    const prevVal = usePrevious(val);
    return prevVal !== val;
  };
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { appsList, isBackgroundProcessActive, isProxyServerRunning } = useSelector(getDesktopSpecificDetails);
  const hasConnectedAppBefore = useSelector(getHasConnectedApp);

  const appsListRef = useRef(null);
  const hasMessageHandlersBeenSet = useRef(false);
  const hasAuthChanged = useHasChanged(user.loggedIn);

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
            actions.updateDesktopSpecificDetails({
              isBackgroundProcessActive: !!newStatus,
            })
          );
          trackBackgroundProcessStartedEvent();
          if (newStatus === true) {
            //Start proxy server
            window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("start-proxy-server").then((res) => {
              const { success, port, proxyIp, helperServerPort } = res;
              dispatch(
                actions.updateDesktopSpecificDetails({
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
                  actions.updateDesktopSpecificAppProperty({
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
                  actions.updateDesktopSpecificAppProperty({
                    appId: payload.id,
                    property: "isScanned",
                    value: true,
                  })
                );
                dispatch(
                  actions.updateDesktopSpecificAppProperty({
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
                  actions.updateDesktopSpecificDetails({
                    proxyPort: port,
                    proxyIp: proxyIp,
                  })
                );
                trackProxyReStartedEvent();
              });
            });
          }
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

      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("deeplink-handler", (payload) => {
        navigate(payload);
      });
    }
  }, [appMode, isBackgroundProcessActive, dispatch, navigate]);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      trackDesktopAppStartedEvent();
    }
  }, [appMode]);

  useEffect(() => {
    if (isProxyServerRunning && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && !hasConnectedAppBefore) {
      dispatch(actions.toggleActiveModal({ modalName: "connectedAppsModal" }));
    }
  }, [appMode, dispatch, hasConnectedAppBefore, isProxyServerRunning]);

  // Set app mode to "DESKTOP" if required. Default is "EXTENSION"
  useEffect(() => {
    const asyncUseEffect = async () => {
      if (!hasAppModeBeenSet || hasAuthChanged) {
        hasAppModeBeenSet = true;
        if (!isExtensionInstalled()) {
          if (isDesktopMode()) {
            dispatch(
              actions.updateAppMode({
                appMode: GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
              })
            );
          }
        } else {
          if (appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
            // Fallback to default value
            dispatch(
              actions.updateAppMode({
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
      StorageService(appMode)
        .saveRecord(getEventsEngineFlag)
        .then(() => notifyAppLoadedToExtension());

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
          team_id: currentlyActiveWorkspace?.id,
          appMode,
          isSyncEnabled: user?.details?.isSyncEnabled,
        });

        return {
          received: true,
        };
      });
    }
  }, [appMode, currentlyActiveWorkspace?.id, dispatch, user?.details?.isSyncEnabled, user?.details?.profile?.uid]);

  return null;
};

export default AppModeInitializer;
