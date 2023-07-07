import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import AUTH from "config/constants/sub/auth";
import AuthPage from "components/authentication/AuthPage";
import DesktopSignIn from "components/authentication/DesktopSignIn";
import EmailAction from "components/misc/EmailAction";
import VerifyEmail from "components/misc/VerifyEmail";
import SignInViaEmailLink from "components/misc/SignInViaEmailLink";

export const authRoutes: RouteObject[] = [
  {
    path: PATHS.AUTH.SIGN_IN.RELATIVE,
    element: <AuthPage authMode={AUTH.ACTION_LABELS.LOG_IN} />,
  },
  {
    path: PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE,
    element: <DesktopSignIn />,
  },
  {
    path: PATHS.AUTH.SIGN_UP.RELATIVE,
    element: <AuthPage authMode={AUTH.ACTION_LABELS.SIGN_UP} />,
  },
  {
    path: PATHS.AUTH.FORGOT_PASSWORD.RELATIVE,
    element: <AuthPage authMode={AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD} />,
  },
  {
    path: PATHS.AUTH.EMAIL_ACTION.RELATIVE,
    element: <EmailAction />,
  },
  {
    path: PATHS.AUTH.RESET_PASSWORD.RELATIVE,
    element: <AuthPage authMode={AUTH.ACTION_LABELS.DO_RESET_PASSWORD} />,
  },
  {
    path: PATHS.AUTH.VERIFY_EMAIL.RELATIVE,
    element: <VerifyEmail />,
  },
  {
    path: PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE,
    element: <SignInViaEmailLink />,
  },
];
