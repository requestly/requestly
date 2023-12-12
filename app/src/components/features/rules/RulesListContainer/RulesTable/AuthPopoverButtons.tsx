import React, { useState } from "react";
import { Button, Row } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { PremiumIcon } from "components/common/PremiumIcon";

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
  isScreenSmall,
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
      <Button
        type={type || "default"}
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
      </Button>
    </AuthConfirmationPopover>
  );
};

export default AuthPopoverButton;
