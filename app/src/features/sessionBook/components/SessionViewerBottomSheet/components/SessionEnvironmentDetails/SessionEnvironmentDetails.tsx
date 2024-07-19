import { useSelector } from "react-redux";
import { getSessionRecordingAttributes } from "store/features/session-recording/selectors";
import { MdOutlineTravelExplore } from "@react-icons/all-files/md/MdOutlineTravelExplore";
import { MdOutlineDisplaySettings } from "@react-icons/all-files/md/MdOutlineDisplaySettings";
import { MdOutlineDevices } from "@react-icons/all-files/md/MdOutlineDevices";
import { MdOutlineScreenshotMonitor } from "@react-icons/all-files/md/MdOutlineScreenshotMonitor";
import { PiBrowsers } from "@react-icons/all-files/pi/PiBrowsers";
import { MdAspectRatio } from "@react-icons/all-files/md/MdAspectRatio";
import { MdLanguage } from "@react-icons/all-files/md/MdLanguage";
import { PiFrameCorners } from "@react-icons/all-files/pi/PiFrameCorners";
import { useMemo } from "react";
import "./sessionEnvDetails.scss";

export const SessionEnvironmentDetails = () => {
  const attributes = useSelector(getSessionRecordingAttributes);

  const aggregateValues = (...values: (string | number)[]): string => {
    return values.filter((v) => !!v).join(" ");
  };

  const sessionEnvDetails = useMemo(() => {
    if (!attributes) return null;

    const { environment } = attributes;
    return [
      {
        label: "Browser",
        icon: <MdOutlineTravelExplore />,
        value: aggregateValues(environment.browser.name, environment.browser.version),
      },
      {
        label: "Operating System",
        icon: <MdOutlineDisplaySettings />,
        value: (
          <>
            {aggregateValues(environment.os.name, environment.os.versionName, environment.os.version)}
            {environment.os.name === "macOS" && environment.os.version === "10.15.7" ? ` (or above)` : null}
          </>
        ),
      },
      {
        label: "Platform",
        icon: <MdOutlineDevices />,
        value: (
          <> {aggregateValues(environment.platform.vendor, environment.platform.type, environment.platform.model)}</>
        ),
      },
      {
        label: "Screen Dimensions",
        icon: <MdOutlineScreenshotMonitor />,
        value: (
          <>
            {environment.screenDimensions.width} x {environment.screenDimensions.height}
          </>
        ),
      },
      {
        label: "Browser Dimensions",
        icon: <PiBrowsers />,
        value: (
          <>
            {environment.browserDimensions.width} x {environment.browserDimensions.height}
          </>
        ),
      },
      { label: "Device Pixel Ratio", icon: <MdAspectRatio />, value: environment.devicePixelRatio },
      {
        label: "Language",
        icon: <MdLanguage />,
        value: environment.language,
      },

      {
        label: "User-Agent",
        icon: <PiFrameCorners />,
        value: environment.userAgent,
      },
    ];
  }, [attributes]);

  return (
    <div className="session-env-details-container">
      {sessionEnvDetails &&
        sessionEnvDetails.map((info, index) => (
          <div className="sessions-env-info-item" key={index}>
            <span className="sessions-env-info-item-label">
              {info.icon}
              {info.label}
            </span>
            <span className="sessions-env-info-item-value">{info.value}</span>
          </div>
        ))}
    </div>
  );
};
