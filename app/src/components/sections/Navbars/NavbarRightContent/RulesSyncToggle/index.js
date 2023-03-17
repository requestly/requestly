import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Popover, Button, Col, Tooltip } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { MdSyncDisabled, MdSync } from "react-icons/md";
import { actions } from "store";
import { setSyncState } from "utils/syncing/SyncUtils";
import { toast } from "../../../../../utils/Toast";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { AUTH } from "modules/analytics/events/common/constants";

const RulesSyncToggle = () => {
  // Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  // Component State
  const [
    isSyncStatusChangeProcessing,
    setIsSyncStatusChangeProcessing,
  ] = useState(false);

  // Premium Check
  const isSyncingAllowed = true;

  const changeIsSyncEnabled = async (syncState) => {
    // If user is not logged in
    if (!user.loggedIn || !user.details || !user.details.profile) {
      // Prompt user to log in
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            redirectURL: window.location.href,
            eventSource: AUTH.SOURCE.ENABLE_SYNC,
          },
        })
      );
      return;
    }

    const proceedChangingStatus = async () => {
      setIsSyncStatusChangeProcessing(true);
      setSyncState(user.details.profile.uid, syncState, appMode)
        .then(() => {
          toast.info(
            `We ${
              syncState ? "will" : "won't"
            } be syncing your rules automatically hereon.`
          );
        })
        .catch(() => {
          toast.error(
            `Sorry, we are experiencing issues updating the sync state.`
          );
        });
      setIsSyncStatusChangeProcessing(false);
    };

    proceedChangingStatus();
  };

  const offerToTurnOnSync = () => {
    return (
      <div style={{ maxWidth: "350px" }}>
        <p>
          Always keep your rules in sync irrespective of the device you use.
        </p>

        <Button
          type="text"
          onClick={() => changeIsSyncEnabled(true)}
          loading={isSyncStatusChangeProcessing}
          icon={<RightOutlined />}
        >
          Turn on syncing
        </Button>
      </div>
    );
  };

  const offerToTurnOffSync = () => {
    return (
      <div style={{ maxWidth: "300px" }}>
        <p>
          Always keep your rules in sync irrespective of the device you use.
        </p>
        {/* <Space> */}
        <Button
          type="primary"
          onClick={() => changeIsSyncEnabled(false)}
          loading={isSyncStatusChangeProcessing}
        >
          Turn off syncing
        </Button>
      </div>
    );
  };

  const getPopoverContent = () => {
    // If user is not logged in
    if (!user.loggedIn || !user.details || !user.details.profile) {
      return offerToTurnOnSync();
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      isSyncingAllowed
    ) {
      // Premium User - Has Backup Enabled
      if (user.details.isSyncEnabled) {
        return offerToTurnOffSync();
      }
      // Premium User - Backup NOT Enabled
      else {
        return offerToTurnOnSync();
      }
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      !isSyncingAllowed
    ) {
      // Non Premium User - Has Backup Enabled (implementation TBD)
      if (user.details.isSyncEnabled) {
        return offerToTurnOffSync();
      } else {
        // Non - Premium User - Backup NOT Enabled
        return offerToTurnOnSync();
      }
    }
  };

  const SyncIcon = () => {
    // If user is not logged in
    if (!user.loggedIn || !user.details || !user.details.profile) {
      return (
        <Col className="display-row-center">
          <Popover
            trigger={["click"]}
            content={getPopoverContent()}
            title="Working locally"
            placement="bottomRight"
          >
            <Button
              type="text"
              className="header-icon-btn"
              icon={<MdSyncDisabled />}
            />
          </Popover>
        </Col>
      );
    }

    if (currentlyActiveWorkspace?.id) {
      return (
        <Col className="display-row-center">
          <Tooltip title="Syncing is on" placement="bottomRight">
            <Button
              type="text"
              className="header-icon-btn"
              icon={<MdSync id="sync-icon" />}
            />
          </Tooltip>
        </Col>
      );
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      isSyncingAllowed
    ) {
      // Premium User - Has Sync Enabled
      if (user.details.isSyncEnabled) {
        return (
          <Col className="display-row-center">
            <Popover
              trigger={["click"]}
              content={getPopoverContent()}
              placement="bottomRight"
              title="Syncing is enabled"
            >
              <Button
                type="text"
                className="header-icon-btn"
                icon={<MdSync id="sync-icon" />}
              />
            </Popover>
          </Col>
        );
      }
      // Premium User - Sync disabled
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
                icon={<MdSyncDisabled />}
              />
            </Popover>
          </Col>
        );
      }
    }

    if (
      (user.details.profile || user.details || user.loggedIn) &&
      !isSyncingAllowed
    ) {
      // Non Premium User - Has Backup Enabled (implementation TBD)
      if (user.details.isSyncEnabled) {
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
                icon={<MdSync id="sync-icon" />}
              />
            </Popover>
          </Col>
        );
      } else {
        // Non - Premium User - Backup NOT Enabled
        return (
          <Col className="display-row-center">
            <Button
              type="text"
              className="header-icon-btn"
              icon={
                <Popover
                  trigger={["click"]}
                  content={getPopoverContent()}
                  placement="bottomRight"
                  title="Working locally"
                >
                  <div
                    style={{ fontSize: "1.5em" }}
                    className="display-row-center"
                  >
                    <MdSyncDisabled />
                  </div>
                </Popover>
              }
            />
          </Col>
        );
      }
    }

    return <></>;
  };

  return (
    <>
      <SyncIcon />
    </>
  );
};

export default RulesSyncToggle;
