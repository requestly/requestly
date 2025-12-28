import React from "react";
import { Alert } from "antd";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { SESSIONBOOK_DEPRECATION_MESSAGE } from "features/sessionBook/constants";

interface SessionBookDeprecationBannerProps {
  style?: React.CSSProperties;
}

export const SessionBookDeprecationBanner: React.FC<SessionBookDeprecationBannerProps> = ({ style }) => {
  return (
    <Alert
      message="Feature Deprecated"
      description={SESSIONBOOK_DEPRECATION_MESSAGE}
      type="warning"
      showIcon
      icon={<MdOutlineWarningAmber />}
      banner
      style={style}
    />
  );
};
