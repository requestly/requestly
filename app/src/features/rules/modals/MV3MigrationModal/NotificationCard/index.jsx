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
import { StorageService } from "init";
import { getAppMode } from "store/selectors";

export function NotificationCard() {
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const appMode = useSelector(getAppMode);

  const [isVisible, setIsVisible] = useState(false);
  const [doesAnyRuleExist, setDoesAnyRuleExist] = useState(false);

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

  const isShowNotification = useMemo(() => {
    const migrationData = getMV3MigrationData();

    return (
      Object.keys(migratedRulesLogs).length > 0 &&
      !migrationData[currentlyActiveWorkspace?.id ?? "private"]?.migrationModalViewed &&
      doesAnyRuleExist
    );
  }, [currentlyActiveWorkspace?.id, doesAnyRuleExist, migratedRulesLogs]);

  useEffect(() => {
    if (isShowNotification) {
      trackMigrationNotificationShown();
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isShowNotification]);

  useEffect(() => {
    Object.keys(migratedRulesLogs).forEach((ruleId) => {
      StorageService(appMode)
        .getRecord(ruleId)
        .then((rule) => {
          if (rule) {
            setDoesAnyRuleExist(true);
          }
        });
    });
  });

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
          <Typography.Text className="content-header">Important update!</Typography.Text>
          <Typography.Text className="content-text">
            Rules updated to support upcoming MV3 changes. Click here to know more.
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
