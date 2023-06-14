import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import AUTH from "config/constants/sub/auth";
import AuthPageView from "views/auth/authPage";
import DesktopSignInView from "views/auth/desktopSignIn";
import EmailActionView from "views/misc/EmailAction";
import VerifyEmailView from "views/misc/VerifyEmail";
import SignInViaEmailLinkView from "views/misc/SignInViaEmailLink";

export const authRoutes: RouteObject[] = [
  {
    path: PATHS.AUTH.SIGN_IN.RELATIVE,
    element: <AuthPageView authMode={AUTH.ACTION_LABELS.LOG_IN} />,
  },
  {
    path: PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE,
    element: <DesktopSignInView />,
  },
  {
    path: PATHS.AUTH.SIGN_UP.RELATIVE,
    element: <AuthPageView authMode={AUTH.ACTION_LABELS.SIGN_UP} />,
  },
  {
    path: PATHS.AUTH.FORGOT_PASSWORD.RELATIVE,
    element: <AuthPageView authMode={AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD} />,
  },
  {
    path: PATHS.AUTH.EMAIL_ACTION.RELATIVE,
    element: <EmailActionView />,
  },
  {
    path: PATHS.AUTH.RESET_PASSWORD.RELATIVE,
    element: <AuthPageView authMode={AUTH.ACTION_LABELS.DO_RESET_PASSWORD} />,
  },
  {
    path: PATHS.AUTH.VERIFY_EMAIL.RELATIVE,
    element: <VerifyEmailView />,
  },
  {
    path: PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE,
    element: <SignInViaEmailLinkView />,
  },
];
