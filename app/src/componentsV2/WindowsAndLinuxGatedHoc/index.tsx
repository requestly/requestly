import { RQButton } from "lib/design-system-v2/components";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserOS } from "utils/Misc";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { trackWindowsAndLinuxBlockerScreenViewed } from "./analytics";
import { snakeCase } from "lodash";
import LINKS from "config/constants/sub/links";
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

  useEffect(() => {
    if (!isGated) {
      return;
    }

    trackWindowsAndLinuxBlockerScreenViewed(snakeCase(featureName));
  }, [isGated, featureName]);

  if (!isGated) {
    return children;
  }

  return (
    <div className="windows-and-linux-gated-hoc-container">
      <div className="windows-and-linux-gated-hoc">
        <img
          width={80}
          height={80}
          alt="Platform gated"
          className="platfrom-gated-image"
          src={"/assets/media/common/platform-gated.svg"}
        />

        <div className="content">
          <div className="title">Coming soon on Windows and Linux 🚀</div>
          <div className="description">
            The {featureName} is currently available only for macOS, but support for Windows and Linux is coming soon!
            🚀
            <br />
            <br />
            In the meantime, you can use the {featureName} in your browser with the{" "}
            <span className="highlight">Requestly Chrome extension</span>. Stay up to date by following our progress on
            GitHub.
          </div>
          <div className="action-btns">
            <RQButton
              onClick={() => {
                // track event
                window.open("https://github.com/requestly/requestly/issues/3062", "_blank");
              }}
              icon={
                <img
                  width={16}
                  height={16}
                  alt="Github logo"
                  className="anticon"
                  src={"/assets/media/common/github-white-logo.svg"}
                />
              }
            >
              Track on Github
            </RQButton>
            <RQButton
              type="primary"
              onClick={() => {
                // track event
                window.open(LINKS.CHROME_EXTENSION, "_blank");
              }}
              icon={<img alt="Chrome logo" className="anticon" src={"/assets/media/common/chrome-white-logo.svg"} />}
            >
              Use Chrome extension
            </RQButton>
          </div>
        </div>
      </div>
    </div>
  );
};
