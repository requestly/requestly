import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRulesModalsContext } from "features/rules/context/modals";

import { RQButton } from "lib/design-system/components";
import { Typography } from "antd";

import BellAnimation from "./BellAnimation";
import { CloseOutlined } from "@ant-design/icons";
import "./card.scss";

export function NotificationCard() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const { openMigratonModalAction } = useRulesModalsContext();

  const closeCard = useCallback((e) => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (location.search.includes("showMigrationInfoCard")) {
      setIsVisible(true);
    }
  }, [location.search]);

  const handleOnClick = useCallback(() => {
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
          closeCard();
        }}
      >
        <RQButton icon={<CloseOutlined />} type="text" />
      </div>
    </div>
  );
}
