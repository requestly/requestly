import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserOS } from "utils/Misc";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./windowsAndLinuxGatedHoc.scss";

interface WindowsAndLinuxGatedHocProps {
  featureName: string;
  children: React.ReactNode;
}

export const WindowsAndLinuxGatedHoc: React.FC<WindowsAndLinuxGatedHocProps> = ({ children, featureName }) => {
  const appMode = useSelector(getAppMode);
  const isFeatureFlagOn = useFeatureIsOn("block_for_windows_and_linux");
  const os = getUserOS();

  const isDesktopApp = appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;
  const isWindowsOrLinux = ["Windows", "Linux"].includes(os);
  const isGated = isFeatureFlagOn && isDesktopApp && isWindowsOrLinux;

  console.log("User OS:", { isGated, os, isFeatureFlagOn, isDesktopApp, isWindowsOrLinux });

  if (!isGated) {
    return children;
  }

  return (
    <div className="windows-and-linux-gated-hoc-container">
      <div className="comming-soon-image">Coming soon on Windows and Linux 🚀</div>
      <div>
        <div className="title"></div>
        <div className="description">
          The {featureName} is currently available only for macOS, but support for Windows and Linux is coming soon! 🚀
          <br />
          In the meantime, you can use the {featureName} in your browser with the <b>Requestly Chrome extension</b>.
          Stay up to date by following our progress on GitHub.
        </div>
        <div className="actions">
          <RQButton>Track on Github</RQButton>
          <RQButton>Use Chrome extension</RQButton>
        </div>
      </div>
    </div>
  );
};
