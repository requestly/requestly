import React from "react";
//SUB COMPONENTS
//VIEWS
import ManageLicenseIndexPage from "../../../components/user/ManageLicenseIndexPage";
import ProtectedRoute from "../../../components/authentication/ProtectedRoute";

export default class License extends React.Component {
  render() {
    return (
      <>
        <ProtectedRoute component={ManageLicenseIndexPage} />
      </>
    );
  }
}
