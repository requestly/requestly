import React from "react";
//SUB COMPONENTS
import AuthPage from "../../../components/authentication/AuthPage";

const AuthPageView = (props) => {
  return (
    <>
      <AuthPage authMode={props.authMode} />
    </>
  );
};

export default AuthPageView;
