import React, { useState } from "react";
import { Row } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { PremiumIcon } from "components/common/PremiumIcon";
import { RQButton, RQButtonProps } from "lib/design-system-v2/components";

interface Props {
  icon: React.ReactNode;
  shape: any;
  type?: RQButtonProps["type"];
  buttonText: string;
  isTooltipShown: boolean;
  onClickHandler: (e?: unknown) => void;
  hasPopconfirm?: boolean;
  tourId?: any;
  trackClickEvent?: () => void;
  isScreenSmall?: boolean;
  isLoggedIn?: boolean;
  authSource?: string;
  isPremium?: boolean;
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
  isScreenSmall = false,
  authSource,
  isPremium = false,
}) => {
  const [isChinaUser, setIsChinaUser] = useState<boolean>(false);

  return (
    <AuthConfirmationPopover
      title={`You need to sign up to ${buttonText.toLowerCase()} rules`}
      disabled={!hasPopconfirm || isChinaUser}
      callback={onClickHandler}
      source={authSource}
    >
      <RQButton
        type={type || "secondary"}
        shape={isScreenSmall ? shape : null}
        onClick={() => {
          trackClickEvent();
          if (isChinaUser) {
            onClickHandler();
            return;
          }
          if (hasPopconfirm) {
            isLoggedIn && onClickHandler();
          } else {
            onClickHandler();
          }
        }}
        onMouseEnter={() => {
          setIsChinaUser(window.isChinaUser ?? false);
        }}
        icon={icon}
        data-tour-id={tourId}
      >
        {!isTooltipShown ? (
          buttonText
        ) : isScreenSmall ? null : (
          <span>
            <Row align="middle" wrap={false}>
              {buttonText}
              {isPremium ? <PremiumIcon featureType="share_rules" source="share_button" /> : null}
            </Row>
          </span>
        )}
      </RQButton>
    </AuthConfirmationPopover>
  );
};

export default AuthPopoverButton;
