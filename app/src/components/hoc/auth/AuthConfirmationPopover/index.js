import { Popconfirm } from "antd";
import APP_CONSTANTS from "config/constants";
import {
  trackPopoverForAuthCancelled,
  trackPopoverForAuthContinued,
  trackPopoverForAuthShown,
} from "modules/analytics/events/common/auth/authPopover";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getUserAuthDetails } from "store/selectors";

import "./popover.scss";

export const AuthConfirmationPopover = ({
  title,
  okText = "Continue",
  cancelText = "Cancel",
  disabled = false,
  callback = null,
  source,
  children,
}) => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const flag = useRef(null);
  flag.current = false;

  const openAuthModal = () => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          callback,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const handleOpenChange = (open) => {
    if (open) {
      trackPopoverForAuthShown(source);
    } else {
      if (!flag.current) trackPopoverForAuthCancelled(source);
    }
  };

  return (
    <Popconfirm
      title={title}
      okText={okText}
      okButtonProps={{ type: "primary" }}
      cancelText={cancelText}
      icon={null}
      disabled={user?.details?.isLoggedIn || disabled}
      overlayClassName="confirmation-popover"
      onConfirm={() => {
        flag.current = true;
        openAuthModal();
        trackPopoverForAuthContinued(source);
      }}
      onOpenChange={handleOpenChange}
    >
      {children}
    </Popconfirm>
  );
};
