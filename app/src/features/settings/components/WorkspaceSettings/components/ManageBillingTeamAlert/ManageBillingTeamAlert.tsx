import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CgOptions } from "@react-icons/all-files/cg/CgOptions";
import { Alert, Button } from "antd";
import { globalActions } from "store/slices/global/slice";
import { getIsManageBillingTeamAlertVisible } from "store/selectors";
import PATHS from "config/constants/sub/paths";
import "./ManageBillingTeamAlert.scss";

export const ManageBillingTeamAlert: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAlertVisible = useSelector(getIsManageBillingTeamAlertVisible);

  return !isAlertVisible ? null : (
    <Alert
      showIcon
      closable
      type="info"
      className="manage-billing-team-alert"
      message={
        <div className="alert-message">
          <span>
            To manage your team's billing details and subscription, go to your team's Billings page in settings.
          </span>

          <Button
            className="manage-btn"
            icon={<CgOptions />}
            onClick={() => {
              dispatch(globalActions.updateIsManageBillingTeamAlertVisible(false));
              navigate(PATHS.SETTINGS.BILLING.ABSOLUTE);
            }}
          >
            Manage billing
          </Button>
        </div>
      }
      onClose={() => {
        dispatch(globalActions.updateIsManageBillingTeamAlertVisible(false));
      }}
    />
  );
};
