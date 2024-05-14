import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRulesModalsContext } from "features/rules/context/modals";

import { RQButton } from "lib/design-system/components";
import { Typography } from "antd";

import BellAnimation from "./BellAnimation";
import { CloseOutlined } from "@ant-design/icons";
import "./card.scss";
import { getMV3MigrationData, saveMV3MigrationData } from "modules/extension/utils";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { isEmpty } from "lodash";
import {
  trackMigrationNotificationClicked,
  trackMigrationNotificationClosed,
  trackMigrationNotificationShown,
} from "features/rules/analytics";

export function NotificationCard() {
  const [isVisible, setIsVisible] = useState(false);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const { openMigratonModalAction } = useRulesModalsContext();

  const closeCard = useCallback(
    (e) => {
      const migrationData = getMV3MigrationData();
      saveMV3MigrationData({
        ...migrationData,
        [currentlyActiveWorkspace?.id ?? "private"]: {
          ...migrationData[currentlyActiveWorkspace?.id ?? "private"],
          migrationModalViewed: true,
        },
      });
      setIsVisible(false);
    },
    [currentlyActiveWorkspace?.id]
  );

  const migratedRulesLogs = useMemo(() => {
    const migrationData = getMV3MigrationData();

    const migratedRulesLogs = migrationData?.[currentlyActiveWorkspace?.id ?? "private"]?.rulesMigrationLogs;

    if (isEmpty(migratedRulesLogs)) return {};

    return migratedRulesLogs;
  }, [currentlyActiveWorkspace]);

  useEffect(() => {
    const migrationData = getMV3MigrationData();

    if (
      Object.keys(migratedRulesLogs).length > 0 &&
      !migrationData[currentlyActiveWorkspace?.id ?? "private"]?.migrationModalViewed
    ) {
      trackMigrationNotificationShown();
      setIsVisible(true);
    }
  }, [currentlyActiveWorkspace?.id, migratedRulesLogs]);

  const handleOnClick = useCallback(() => {
    trackMigrationNotificationClicked();
    closeCard();
    openMigratonModalAction();
  }, [closeCard, openMigratonModalAction]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`notification-card-container`} onClick={handleOnClick}>
      <div className="content-container">
        <BellAnimation className="notification-icon" />
        <div className="content">
          <Typography.Text className="content-header">Important updates!</Typography.Text>
          <Typography.Text className="content-text">
            We have upgraded to Chrome MV3. Click here to know more.
          </Typography.Text>
        </div>
      </div>
      <div
        className="close-container"
        onClick={(e) => {
          e.stopPropagation();
          trackMigrationNotificationClosed();
          closeCard();
        }}
      >
        <RQButton icon={<CloseOutlined />} type="text" />
      </div>
    </div>
  );
}
