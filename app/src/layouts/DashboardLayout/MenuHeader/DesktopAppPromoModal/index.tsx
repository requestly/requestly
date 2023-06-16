import React, { useMemo } from "react";
import { RQModal } from "lib/design-system/components";
import LINKS from "config/constants/sub/links";
import { UAParser } from "ua-parser-js";
import { Button } from "antd";
import { AppleFilled, WindowsFilled } from "@ant-design/icons";
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
          displayName: "Mac",
          icon: <AppleFilled />,
          link: LINKS.DOWNLOAD_DESKTOP_APP.MACOS,
        };

      case OS.WINDOWS:
        return {
          os: "windows",
          displayName: "Windows",
          icon: <WindowsFilled />,
          link: LINKS.DOWNLOAD_DESKTOP_APP.WINDOWS,
        };

      default:
        return {
          os: "linux",
          displayName: "Linux",
          icon: <LinuxIcon />,
          link: LINKS.DOWNLOAD_DESKTOP_APP.LINUX,
        };
    }
  }, []);

  return (
    <RQModal centered open={open} width={"995px"} onCancel={onCancel} className="desktop-app-promo-modal">
      <div className="left-section">
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
          Download for {downloadLinkInfo.displayName}
        </Button>
        <a
          target="_blank"
          rel="noreferrer"
          className="view-all-platforms-link"
          href={LINKS.REQUESTLY_DOWNLOAD_PAGE}
          onClick={() => trackDesktopAppPromoClicked("topbar", "view_more_options")}
        >
          View all platforms
        </a>
      </div>
      <div className="right-section">
        <img width={480} height={360} alt="Desktop banner" src="/assets/img/banners/desktop-promo.png" />
      </div>
    </RQModal>
  );
};
