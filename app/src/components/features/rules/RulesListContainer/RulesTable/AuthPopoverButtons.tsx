import React from "react";
import { Row } from "antd";
import { RQButton } from "lib/design-system/components";
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
    <AuthConfirmationPopover
      title={`You need to sign up to ${buttonText.toLowerCase()} rules`}
      disabled={!hasPopconfirm || isChinaUser}
      callback={onClickHandler}
      source={authSource}
    >
      <PremiumFeature
        disabled={!isLoggedIn}
        feature={[feature]}
        onContinue={() => {
          trackClickEvent();
          onClickHandler();
        }}
        popoverPlacement="bottomLeft"
      >
        <RQButton icon={icon}>
          {!isTooltipShown ? (
            buttonText
          ) : isScreenSmall ? null : (
            <span>
              <Row align="middle" wrap={false}>
                {buttonText}
                {!getFeatureLimitValue(feature) ? (
                  <PremiumIcon featureType="share_rules" source="share_button" />
                ) : null}
              </Row>
            </span>
          )}
        </RQButton>
      </PremiumFeature>
    </AuthConfirmationPopover>
  );
};

export default AuthPopoverButton;
