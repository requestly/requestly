import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Popover, Button, Space, Col } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { getUserAuthDetails, getAppMode } from "store/selectors";
import { setIsBackupEnabled } from "utils/BackupUtils";
import { MdCloudOff } from "react-icons/md";
import { actions } from "store";
import { IoCloudDoneOutline } from "react-icons/io5";
import { redirectToBackups } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { createBackupIfRequired } from "utils/BackupUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { AUTH } from "modules/analytics/events/common/constants";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";

const RulesBackupToggle = () => {
  const navigate = useNavigate();

  // Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  // Component State
  const [
    isBackupStatusChangeProcessing,
    setIsBackupStatusChangeProcessing,
  ] = useState(false);

  // Premium Check
  const isPremiumUser = user?.details?.isPremium;

  const changeIsBackupEnabled = async (state) => {
    // If user is not logged in
    if (!user.loggedIn || !user.details || !user.details.profile) {
      // Prompt user to log in
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            eventSource: AUTH.SOURCE.ENABLE_BACKUP,
          },
        })
      );
      return;
    }

    const proceedChangingStatus = async () => {
      setIsBackupStatusChangeProcessing(true);

      await setIsBackupEnabled(user.details.profile.uid, state);
      // if (success) {
      // refreshUserInGlobalState(dispatch);
      // }
      // Wait a sec for state to get updated
      // setTimeout(() => {
      setIsBackupStatusChangeProcessing(false);
      // }, 2000);
    };

    proceedChangingStatus();
    return;
  };

  const offerToTurnOnBackups = () => {
    return (
      <div style={{ maxWidth: "350px" }}>
        <p>
          Securely backup your Rules to Requestly servers so that you don't ever
          lose them while switching devices.
        </p>

        <Space>
          <Button
            type="primary"
            onClick={() => changeIsBackupEnabled(true)}
            loading={isBackupStatusChangeProcessing}
            icon={<RightOutlined />}
          >
            Turn on backups
          </Button>
          {!user.loggedIn || !user.details || !user.details.profile ? null : (
            <Button
              type="secondary"
              onClick={() => redirectToBackups(navigate)}
            >
              View previous backups
            </Button>
          )}
        </Space>
      </div>
    );
  };

  const offerToTurnOffBackups = () => {
    return (
      <div style={{ maxWidth: "300px" }}>
        <p>
          Securely backup your Rules to Requestly servers so that you don't ever
          lose them while switching devices.
        </p>
        <Space>
          <Button
            type="primary"
            onClick={() => changeIsBackupEnabled(false)}
            loading={isBackupStatusChangeProcessing}
          >
            Turn off backups
          </Button>
          {!user.loggedIn || !user.details || !user.details.profile ? null : (
            <Button
              onClick={() => redirectToBackups(navigate)}
              type="secondary"
            >
              Existing Backups
            </Button>
          )}
        </Space>
      </div>
    );
  };

  const getPopoverContent = () => {
    // If user is not logged in
    if (!user.loggedIn || !user.details || !user.details.profile) {
      return offerToTurnOnBackups();
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      isPremiumUser
    ) {
      // Premium User - Has Backup Enabled
      if (user.details.isBackupEnabled) {
        return offerToTurnOffBackups();
      }
      // Premium User - Backup NOT Enabled
      else {
        return offerToTurnOnBackups();
      }
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      !isPremiumUser
    ) {
      // Non Premium User - Has Backup Enabled (implementation TBD)
      if (user.details.isBackupEnabled) {
        return offerToTurnOffBackups();
      } else {
        // Non - Premium User - Backup NOT Enabled
        return offerToTurnOnBackups();
      }
    }
  };

  useEffect(() => {
    if (user?.loggedIn && user?.details?.isBackupEnabled) {
      createBackupIfRequired(appMode);
    }
  }, [appMode, user]);

  const BackupIcon = () => {
    // If user is not logged in
    if (!user.loggedIn || !user.details || !user.details.profile) {
      return (
        <Col className="display-row-center">
          <Popover
            trigger={["click"]}
            content={getPopoverContent()}
            placement="bottomRight"
            title="Working locally"
          >
            <Button
              type="text"
              className="header-icon-btn"
              icon={<MdCloudOff className="hp-text-color-black-60 " />}
            />
          </Popover>
        </Col>
      );
    }

    if (
      appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE ||
      currentlyActiveWorkspace?.id
    ) {
      return null;
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      isPremiumUser
    ) {
      // Premium User - Has Backup Enabled
      if (user.details.isBackupEnabled) {
        return (
          <Col className="display-row-center">
            <Popover
              trigger={["click"]}
              content={getPopoverContent()}
              placement="bottomRight"
              title="Backups are enabled."
            >
              <Button
                type="text"
                className="header-icon-btn"
                icon={<IoCloudDoneOutline className="hp-text-color-black-60" />}
              />
            </Popover>
          </Col>
        );
      }
      // Premium User - Backup NOT Enabled
      else {
        return (
          <Col className="display-row-center">
            <Popover
              trigger={["click"]}
              content={getPopoverContent()}
              placement="bottomRight"
              title="Working locally"
            >
              <Button
                type="text"
                className="header-icon-btn"
                icon={<MdCloudOff className="hp-text-color-black-60 " />}
              />
            </Popover>
          </Col>
        );
      }
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      !isPremiumUser
    ) {
      // Non Premium User - Has Backup Enabled (implementation TBD)
      if (user.details.isBackupEnabled) {
        return (
          <Col className="display-row-center">
            <Popover
              trigger={["click"]}
              content={getPopoverContent()}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="header-icon-btn"
                icon={
                  <IoCloudDoneOutline className="hp-text-color-black-60 " />
                }
              />
            </Popover>
          </Col>
        );
      } else {
        // Non - Premium User - Backup NOT Enabled
        return (
          <Col className="display-row-center">
            <Popover
              trigger={["click"]}
              content={getPopoverContent()}
              placement="bottomRight"
              title="Working locally"
            >
              <Button
                type="text"
                className="header-icon-btn"
                icon={<MdCloudOff className="hp-text-color-black-60 " />}
              />
            </Popover>
          </Col>
        );
      }
    }

    return <></>;
  };

  return (
    <>
      <BackupIcon />
    </>
  );
};

export default RulesBackupToggle;
