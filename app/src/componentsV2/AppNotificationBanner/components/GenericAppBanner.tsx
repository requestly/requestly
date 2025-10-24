import React, { useState } from "react";
import { Banner } from "../banner.types";
import { useRenderBannerText } from "../hooks/useRenderBannerText";
import BaseBanner from "./BaseBanner";
import { useBannerAction } from "../hooks/useBannerAction";

interface Props {
  banner: Banner;
  onClose: (e: React.MouseEvent) => void;
}

export const GenericAppBanner: React.FC<Props> = ({ banner, onClose }) => {
  const renderText = useRenderBannerText(banner);
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const actionsConfig = useBannerAction(banner.actions || [], setIsRequestAccessModalOpen);

  return (
    <BaseBanner
      banner={banner}
      onClose={onClose}
      text={renderText}
      actionsConfig={actionsConfig}
      isRequestAccessModalOpen={isRequestAccessModalOpen}
      setIsRequestAccessModalOpen={setIsRequestAccessModalOpen}
    />
  );
};
