import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
// import AUTH from "config/constants/sub/auth";
import DesktopSignIn from "components/authentication/DesktopSignIn";
import EmailAction from "components/misc/EmailAction";
import VerifyEmail from "components/misc/VerifyEmail";
import SignInViaEmailLink from "components/misc/SignInViaEmailLink";
import LoginHandler from "components/authentication/LoginHandler";
import { BStackAuthInitHandler } from "features/onboarding/screens/BStackAuthInitHandler/BStackAuthInitHandler";
import { AuthPage } from "features/onboarding/screens/auth/components/AuthPage/AuthPage";
export const authRoutes: RouteObject[] = [
  {
    path: PATHS.AUTH.LOGIN.RELATIVE,
    element: <LoginHandler />,
  },
  {
    path: PATHS.AUTH.START.RELATIVE,
    element: <BStackAuthInitHandler />,
  },
  {
    path: PATHS.AUTH.SIGN_IN.RELATIVE,
    element: <AuthPage />,
  },
  {
    path: PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE,
    element: <DesktopSignIn />,
  },
  {
    path: PATHS.AUTH.SIGN_UP.RELATIVE,
    element: <Navigate to={PATHS.AUTH.START.RELATIVE} />,
  },
  // {
  //   path: PATHS.AUTH.FORGOT_PASSWORD.RELATIVE,
  //   element: <AuthPage authMode={AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD} />,
  // },
  {
    path: PATHS.AUTH.EMAIL_ACTION.RELATIVE,
    element: <EmailAction />,
  },
  // {
  //   path: PATHS.AUTH.RESET_PASSWORD.RELATIVE,
  //   element: <AuthPage authMode={AUTH.ACTION_LABELS.DO_RESET_PASSWORD} />,
  // },
  {
    path: PATHS.AUTH.VERIFY_EMAIL.RELATIVE,
    element: <VerifyEmail />,
  },
  {
    path: PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE,
    element: <SignInViaEmailLink />,
  },
];
