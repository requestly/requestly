import React, { useMemo } from "react";
import { RQModal } from "lib/design-system/components";
import LINKS from "config/constants/sub/links";
import { UAParser } from "ua-parser-js";
import { Button } from "antd";
import { AppleFilled, WindowsFilled } from "@ant-design/icons";
import { capitalize } from "lodash";
import { ReactComponent as DesktopBanner } from "./desktop-banner.svg";
import { ReactComponent as BlueUnderline } from "./blue-underline.svg";
import { ReactComponent as LinuxIcon } from "./linux.svg";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";
import "./desktopAppPromoModal.css";

enum OS {
  MAC = "Mac OS",
  WINDOWS = "Windows",
}

interface DesktopAppPromoModalProps {
  open: boolean;
  onCancel: () => void;
}

export const DesktopAppPromoModal: React.FC<DesktopAppPromoModalProps> = ({ open, onCancel }) => {
  const downloadLinkInfo = useMemo(() => {
    const ua = new UAParser(window.navigator.userAgent);
    const os = ua.getOS();

    switch (os.name) {
      case OS.MAC:
        return {
          os: "mac",
          icon: <AppleFilled />,
          link: LINKS.DOWNLOAD_DESKTOP_APP.MACOS,
        };

      case OS.WINDOWS:
        return {
          os: "windows",
          icon: <WindowsFilled />,
          link: LINKS.DOWNLOAD_DESKTOP_APP.WINDOWS,
        };

      default:
        return {
          os: "linux",
          icon: <LinuxIcon />,
          link: LINKS.DOWNLOAD_DESKTOP_APP.LINUX,
        };
    }
  }, []);

  return (
    <RQModal className="desktop-app-promo-modal" width={"995px"} open={open} destroyOnClose={true} onCancel={onCancel}>
      <div className="left-section">
        {/* <div className="pink-gradient"></div>
        <div className="blue-gradient"></div> */}
        <h1 className="header">
          Requestly is more <br />
          powerful on{" "}
          <span className="desktop-underline">
            Desktop! <BlueUnderline />
          </span>
        </h1>
        <div className="caption">
          Inpect and modify HTTP(S) traffic from any browser, <br />
          desktop apps & mobile apps
        </div>

        <Button
          block
          type="primary"
          href={downloadLinkInfo.link}
          icon={downloadLinkInfo.icon}
          className="download-btn"
          onClick={() => trackDesktopAppPromoClicked("topbar", `download_${downloadLinkInfo.os}`)}
        >
          Download for {`${capitalize(downloadLinkInfo.os)}`}
        </Button>
        <a
          target="_blank"
          rel="noreferrer"
          className="view-all-platforms-link"
          href={LINKS.REQUESTLY_DESKTOP_APP}
          onClick={() => trackDesktopAppPromoClicked("topbar", "view_more_options")}
        >
          View all platforms
        </a>
      </div>
      <div className="right-section">
        <DesktopBanner />
      </div>
    </RQModal>
  );
};
