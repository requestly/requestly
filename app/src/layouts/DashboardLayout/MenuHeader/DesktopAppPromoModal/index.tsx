import React from "react";
import { RQModal } from "lib/design-system/components";
import LINKS from "config/constants/sub/links";
import { Button } from "antd";
import { AppleFilled } from "@ant-design/icons";
import { ReactComponent as DesktopBanner } from "./desktop-banner.svg";
import { ReactComponent as BlueUnderline } from "./blue-underline.svg";
import "./desktopAppPromoModal.css";

interface DesktopAppPromoModalProps {
  open: boolean;
  onCancel: () => void;
}

export const DesktopAppPromoModal: React.FC<DesktopAppPromoModalProps> = ({ open, onCancel }) => {
  return (
    <RQModal className="desktop-app-promo-modal" width={"995px"} open={open} destroyOnClose={true} onCancel={onCancel}>
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
        <Button className="download-btn" icon={<AppleFilled />} type="primary" block>
          Download for Mac
        </Button>
        <a
          className="view-all-platforms-link"
          href={LINKS.REQUESTLY_DESKTOP_APP}
          target="_blank"
          rel="noopener noreferrer"
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
