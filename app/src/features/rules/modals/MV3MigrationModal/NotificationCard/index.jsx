import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { actions } from "store";
import { useDispatch } from "react-redux";

import { RQButton } from "lib/design-system/components";
import { Typography } from "antd";

import BellAnimation from "./BellAnimation";
import { CloseOutlined } from "@ant-design/icons";
import "./card.scss";

export function MigrationInfoCard() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback((e) => {
    e.stopPropagation();
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (location.search.includes("showMigrationInfoCard")) {
      setIsVisible(true);
    }
  }, [location]);

  const handleOnClick = useCallback(() => {
    console.log("Open modal, close this card");
    dispatch(
      actions.toggleActiveModal({
        modalName: "mv3InfoModal",
      })
    );
  }, [dispatch]);

  return (
    <div className={`card-container ${isVisible ? "visible" : "hidden"}`} onClick={handleOnClick}>
      <div className="content-container">
        <BellAnimation className="notification-icon" />
        <div className="content">
          <Typography.Text className="content-header">Important updates!</Typography.Text>
          <Typography.Text className="content-text">
            We have upgraded to Chrome MV3. Click here to know more.
          </Typography.Text>
        </div>
      </div>
      <div className="close-container" onClick={handleClose}>
        <RQButton icon={<CloseOutlined />} type="text" />
      </div>
    </div>
  );
}
