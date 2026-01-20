import React, { ReactNode, useEffect } from "react";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { Typography } from "antd";
import { RQModal } from "lib/design-system/components";
import { trackContactUsModalMeetScheduled, trackContactUsModalViewed } from "./analytics";

interface Props {
  isOpen: boolean;
  heading?: ReactNode;
  subHeading?: ReactNode;
  source: string;
  onCancel: () => void;
}

export const ContactUsModal: React.FC<Props> = ({ isOpen, heading, subHeading, onCancel, source }) => {
  useCalendlyEventListener({
    onEventScheduled: () => trackContactUsModalMeetScheduled(source),
  });

  useEffect(() => {
    if (isOpen) trackContactUsModalViewed(source);
  }, [isOpen, source]);

  return (
    <RQModal open={isOpen} onCancel={onCancel}>
      <div style={{ padding: "1rem" }}>
        <Typography.Title level={3} className="text-center">
          {heading}
        </Typography.Title>
        <Typography.Title level={5} style={{ marginTop: 0 }} className="text-center">
          {subHeading}
        </Typography.Title>
        <InlineWidget
          styles={{ height: "602px", marginTop: "4px" }}
          url="https://calendly.com/requestly/sagar"
          pageSettings={{
            hideEventTypeDetails: true,
            hideLandingPageDetails: true,
          }}
        />
      </div>
    </RQModal>
  );
};
