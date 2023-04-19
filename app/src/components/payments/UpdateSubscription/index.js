import React from "react";
import { Navigate } from "react-router-dom";
import APP_CONSTANTS from "../../../config/constants";

const UpdateSubscription = () => <Navigate to={APP_CONSTANTS.PATHS.ACCOUNT.UPDATE_SUBSCRIPTION_CONTACT_US.ABSOLUTE} />;

export default UpdateSubscription;
