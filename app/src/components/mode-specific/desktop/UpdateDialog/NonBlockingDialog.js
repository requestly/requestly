import { notification } from "antd";
import { useCallback, useEffect } from "react";
import { getTimeDifferenceFromTimestamps } from "utils/DateTimeUtils";

/* THE UPDATE NOTIFICATION SHOWN TO ALL USERS ON COMPATIBLE VERSIONS */
const NonBlockingDialog = ({ updateDetails, quitAndInstall }) => {
  const onClickHandler = () => {
    quitAndInstall();
  };

  const stableOnClickHandler = useCallback(onClickHandler, [quitAndInstall]);

  useEffect(() => {
    /* Fix for multiple download dialogs:
     * tracking the last time the dialog was shown
     * by saving the timestamp in the window object.
     *
     * This fixes re-showing the dialog because
     * of re-renders on the top level component
     *
     * Edit: Now also deleting the last shown dialog
     * before showing the next one, so that
     * it is never possible to have multiple dialogs on the screen
     *
     * Also saving state for if the dialog was closed,
     * so it will not be shown again (during that session)
     */
    if (
      !window.updateDialogClosed &&
      (!window.updateDialogLastShown ||
        getTimeDifferenceFromTimestamps(Date.now(), window.updateDialogLastShown) > 300 * 1000) // shown every 5 minute
    ) {
      notification.destroy();
      notification.info({
        message: `New Update Downloaded (${updateDetails?.version})`,
        description: "Click this to Restart & Install",
        placement: "bottomRight",
        onClick: stableOnClickHandler,
        onClose: () => {
          window.updateDialogClosed = true;
        },
        duration: 0,
        style: { cursor: "pointer" },
        maxCount: 1,
      });
      window.updateDialogLastShown = Date.now();
    } else {
      console.log("Too many updates too soon. slowing down");
    }
  }, [stableOnClickHandler, updateDetails?.version]);

  return null;
};

export default NonBlockingDialog;
