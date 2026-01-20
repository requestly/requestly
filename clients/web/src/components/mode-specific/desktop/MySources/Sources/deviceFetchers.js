export const getAndroidDevices = async () => {
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("detect-available-android-devices", {}).then((res) => {
    console.log("Available Android Devices", res);
    return res;
  });
};

export const getIosSimulators = async () => {
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("detect-available-ios-simulators", {}).then((res) => {
    console.log("Available iOS Simulators", res);
    return res;
  });
};
