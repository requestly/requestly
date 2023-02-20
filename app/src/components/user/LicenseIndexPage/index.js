import React from "react";
//SUB COMPONENTS
import ProtectedRoute from "../../authentication/ProtectedRoute";
import ApplyLicense from "../ApplyLicense";
//ACTIONS
// import { fetchlicenseInfo } from "./actions";

const LicenseIndexPage = () => {
  return <ProtectedRoute component={ApplyLicense} />;
};
export default LicenseIndexPage;
