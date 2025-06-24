import React, { useState, useMemo } from "react";
import { Banner } from "../banner.types";
import BaseBanner from "./BaseBanner";
import { useRenderBannerText } from "../hooks/useRenderBannerText";
import { useBannerAction } from "../hooks/useBannerAction";
import STORAGE from "config/constants/sub/storage";
interface Props {
  banner: Banner;
  onClose: (e: React.MouseEvent) => void;
}

export const ChromeReviewBanner: React.FC<Props> = ({ banner, onClose }) => {
  const [hasReviewed, setHasReviewed] = useState(
    () => localStorage.getItem(STORAGE.LOCAL_STORAGE.REDIRECT_TO_CHROME_STORE_REVIEW) === "true"
  );
  const actions = useBannerAction(banner.actions || []);
  const bannerText = useRenderBannerText(banner);
  const [preReviewText, postReviewText] = bannerText.split("||");
  const actionsConfig = useMemo(() => {
    if (hasReviewed) return [];
    return actions.map((action) => ({
      ...action,
      onClick: () => {
        setHasReviewed(true);
        action.onClick();
      },
    }));
  }, [hasReviewed, actions]);

  return (
    <BaseBanner
      banner={banner}
      onClose={onClose}
      text={!hasReviewed ? preReviewText : postReviewText}
      actionsConfig={actionsConfig}
    />
  );
};
