import React, { useEffect } from "react";
import { Button, Typography } from "antd";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import {
  trackProductAnnouncementClicked,
  trackProductAnnouncementViewed,
} from "modules/analytics/events/misc/productAnnouncement";
//@ts-ignore
import RightArrow from "../../../../assets/icons/right-arrow.svg";

const ProductAnnouncement: React.FC = () => {
  useEffect(() => {
    trackProductAnnouncementViewed("opensource", "sidebar");
  }, []);

  return (
    <>
      <Typography.Text className="text-sm text-bold">
        We're now Open-Source 🚀
      </Typography.Text>
      {/* <Typography.Text type="secondary">
        Contributions and feedback are welcome.
      </Typography.Text> */}
      <Button
        type="text"
        className="announcement-os-btn"
        onClick={() => {
          trackProductAnnouncementClicked("opensource", "sidebar");
          trackSidebarClicked("product_announcement");
        }}
        href="https://github.com/requestly/requestly/"
        target="_blank"
      >
        Checkout Github
        <img
          width="10.67px"
          height="10px"
          src={RightArrow}
          alt="right arrow"
          className="announcement-os-icon"
        />
      </Button>
    </>
  );
};

export default ProductAnnouncement;
