import React from "react";
// SUB COMPONENTS
import TopBanner from "../common/TopBanner";
// CONSTANTS
import APP_CONSTANTS from "../../../../../../config/constants";

const { PATHS } = APP_CONSTANTS;

const EmailVerificationBanner = ({
  resendVerificationEmailHandler,
  currentPath,
}) => {
  return (
    <TopBanner
      content={() => (
        <strong>Please check your email for the verification link</strong>
      )}
      ctaText="Resend Email Verification link"
      ctaIcon={() => <i className="ni ni-send" />}
      bannerIcon={() => <i className="fas fa-exclamation-circle" />}
      ctaHandler={resendVerificationEmailHandler}
      ctaIconPostion="end"
      currentPath={currentPath}
      blackListPaths={[PATHS.AUTH.VERIFY_EMAIL.RELATIVE]}
      dismissible={false}
    />
  );
};

export default EmailVerificationBanner;
