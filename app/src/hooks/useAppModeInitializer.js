import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../store";
// UTILS
import {
  getAppMode,
  getDesktopSpecificDetails,
  getUserAuthDetails,
} from "../store/selectors";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// ACTIONS
import {
  startBackgroundProcess,
  invokeAppDetectionInBackground,
} from "../actions/DesktopActions";
import {
  trackAppDetectedEvent,
  trackAppDisconnectedEvent,
} from "modules/analytics/events/desktopApp/apps";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAndUpdateInstallationDate, isDesktopMode } from "utils/Misc";
import firebaseApp from "firebase.js";
import { isExtensionInstalled } from "actions/ExtensionActions";
import {
  trackBackgroundProcessStartedEvent,
  trackDesktopAppStartedEvent,
  trackProxyReStartedEvent,
  trackProxyServerStartedEvent,
} from "modules/analytics/events/desktopApp";
// import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";

const useAppModeInitializer = () => {
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
  const { appsList, isBackgroundProcessActive } = useSelector(
    getDesktopSpecificDetails
  );
  // Component State
  const [hasAppModeBeenSet, setHasAppModeBeenSet] = useState(false);

  const appsListRef = useRef(null);
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
            window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(
              "start-proxy-server"
            ).then((res) => {
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
              window.RQ.DESKTOP.SERVICES.IPC.registerEvent(
                "browser-closed",
                (payload) => {
                  dispatch(
                    actions.updateDesktopSpecificAppProperty({
                      appId: payload.appId,
                      property: "isActive",
                      value: false,
                    })
                  );
                  trackAppDisconnectedEvent(
                    appsListRef.current[payload.appId]?.name
                  );
                }
              );
              // Set handler for activable sources
              window.RQ.DESKTOP.SERVICES.IPC.registerEvent(
                "app-detected",
                (payload) => {
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
                }
              );
              // Get Active sources
              const appsListArray = Object.values(appsListRef.current);
              invokeAppDetectionInBackground(appsListArray);

              window.RQ.DESKTOP.SERVICES.IPC.registerEvent(
                "proxy-restarted",
                (payload) => {
                  const { port, proxyIp } = payload;
                  dispatch(
                    actions.updateDesktopSpecificDetails({
                      proxyPort: port,
                      proxyIp: proxyIp,
                    })
                  );
                  trackProxyReStartedEvent();
                }
              );
            });
          }
        });
      }
    }
  }, [appMode, isBackgroundProcessActive, dispatch]);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      trackDesktopAppStartedEvent();
    }
  }, [appMode]);

  // Set app mode - "REMOTE" || "DESKTOP" if required. Default is "EXTENSION"
  useEffect(() => {
    const ifPossibleSetAppModeRemote = async () => {
      return false;
      // if (user?.loggedIn) {
      //   if (await isUserUsingAndroidDebugger(user?.details?.profile?.uid)) {
      //     dispatch(
      //       actions.updateAppMode({
      //         appMode: GLOBAL_CONSTANTS.APP_MODES.REMOTE,
      //       })
      //     );
      //     return true;
      //   } else return false;
      // } else return false;
    };

    const asyncUseEffect = async () => {
      if (!hasAppModeBeenSet || hasAuthChanged) {
        if (!isExtensionInstalled()) {
          if (isDesktopMode()) {
            dispatch(
              actions.updateAppMode({
                appMode: GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
              })
            );
          } else {
            const settingAppModeRemoteSuccess = await ifPossibleSetAppModeRemote();
            if (
              !settingAppModeRemoteSuccess &&
              appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE
            ) {
              // Fallback to default value
              dispatch(
                actions.updateAppMode({
                  appMode: GLOBAL_CONSTANTS.APP_MODES.EXTENSION,
                })
              );
            }
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
        setHasAppModeBeenSet(true);
      }
    };

    asyncUseEffect();
  }, [
    appMode,
    dispatch,
    hasAppModeBeenSet,
    hasAuthChanged,
    user?.details?.profile?.uid,
    user?.loggedIn,
  ]);

  // Things that need 100% valid "appMode"
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      if (hasAppModeBeenSet) {
        // Attributes
        getAndUpdateInstallationDate(appMode, true, !!user);
      }
    });
  }, [appMode, hasAppModeBeenSet]);
};

export default useAppModeInitializer;
