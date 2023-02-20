import React from "react";
import { useNavigate } from "react-router-dom";
// SUB COMPONENTS
import SpinnerColumn from "../../../misc/SpinnerColumn";
// UTILS
import {
  getAppMode,
  getDesktopSpecificDetails,
} from "../../../../store/selectors";
import { redirectToRules } from "../../../../utils/RedirectionUtils";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import ProCard from "@ant-design/pro-card";
import Sources from "./Sources";
import { useSelector } from "react-redux";

const MySources = () => {
  const navigate = useNavigate();

  //Global State
  const appMode = useSelector(getAppMode);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { isBackgroundProcessActive } = desktopSpecificDetails;

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
    redirectToRules(navigate);
  }

  if (!isBackgroundProcessActive) {
    return <SpinnerColumn message="Loading background process" />;
  }

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Sources />
      </ProCard>
    </React.Fragment>
  );
};

export default MySources;
