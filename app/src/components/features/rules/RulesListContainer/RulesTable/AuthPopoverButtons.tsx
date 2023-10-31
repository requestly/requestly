import React from "react";
import { Button, Row } from "antd";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { PremiumIcon } from "components/common/PremiumIcon";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumFeature } from "features/pricing";

interface Props {
  icon: React.ReactNode;
  shape: any;
  type?: any;
  buttonText: string;
  isTooltipShown: boolean;
  onClickHandler: () => void;
  hasPopconfirm: boolean;
  tourId?: any;
  trackClickEvent: () => void;
  isScreenSmall: boolean;
  isLoggedIn: boolean;
  authSource?: string;
  feature?: FeatureLimitType;
}

const AuthPopoverButton: React.FC<Props> = ({
  icon,
  shape,
  type = null,
  buttonText,
  isTooltipShown,
  onClickHandler,
  hasPopconfirm = false,
  tourId = null,
  trackClickEvent = () => {},
  isLoggedIn,
  isScreenSmall,
  authSource,
  feature = null,
}) => {
  const isChinaUser = window.isChinaUser ?? false;
  const { getFeatureLimitValue } = useFeatureLimiter();

  return (
    <PremiumFeature
      disabled={!isLoggedIn}
      feature={feature}
      onContinue={() => {
        trackClickEvent();
        onClickHandler();
      }}
      popoverPlacement="bottomLeft"
    >
      <AuthConfirmationPopover
        title={`You need to sign up to ${buttonText.toLowerCase()} rules`}
        disabled={!hasPopconfirm || isChinaUser}
        callback={onClickHandler}
        source={authSource}
      >
        <Button type={type || "default"} shape={isScreenSmall ? shape : null} icon={icon} data-tour-id={tourId}>
          {!isTooltipShown ? (
            buttonText
          ) : isScreenSmall ? null : (
            <span>
              <Row align="middle" wrap={false}>
                {buttonText}
                {feature && !getFeatureLimitValue(feature) ? <PremiumIcon /> : null}
              </Row>
            </span>
          )}
        </Button>
      </AuthConfirmationPopover>
    </PremiumFeature>
  );
};

export default AuthPopoverButton;
