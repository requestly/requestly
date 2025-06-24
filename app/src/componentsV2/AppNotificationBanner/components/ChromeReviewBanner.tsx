import React, { useState } from "react";
import { Banner } from "../banner.types";
import { capitalize, has } from "lodash";
import { trackAppBannerCtaClicked } from "../analytics";
import { RQButton } from "lib/design-system/components";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { redirectToUrl } from "utils/RedirectionUtils";
import BaseBanner from "./BaseBanner";
import { useRenderBannerText } from "../hooks/useRenderBannerText";
import { useBannerAction } from "../hooks/useBannerAction";

interface Props {
  banner: Banner;
  onClose: (e: React.MouseEvent) => void;
}

export const ChromeReviewBanner: React.FC<Props> = ({ banner, onClose }) => {
  const [hasReviewed, setHasReviewed] = useState(
    () => localStorage.getItem("isRedirectedTOChromeStoreReview") === "true"
  );
  const actions = useBannerAction(banner.actions || []);
  const bannerText = useRenderBannerText(banner);
  const text = !hasReviewed ? bannerText.split("||")[0] : bannerText.split("||")[1];
  const actionsConfig = hasReviewed
    ? []
    : actions.map((action) => ({
        ...action,
        onClick: () => {
          setHasReviewed(true);
          action.onClick();
        },
      }));

  return <BaseBanner banner={banner} onClose={onClose} text={text} actionsConfig={actionsConfig} />;
};
