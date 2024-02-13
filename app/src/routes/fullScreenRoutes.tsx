import PATHS from "config/constants/sub/paths";
import { Navigate, RouteObject } from "react-router-dom";
import PaymentFail from "views/misc/payments/paymentFail";
import PaymentSuccess from "views/misc/payments/paymentSuccess";

export const fullScreenRoutes: RouteObject[] = [
  {
    path: PATHS.PAYMENT_SUCCESS.ABSOLUTE,
    element: <PaymentSuccess />,
  },
  {
    path: PATHS.PAYMENT_FAIL.ABSOLUTE,
    element: <PaymentFail />,
  },
  {
    path: PATHS.ANY,
    element: <Navigate to={PATHS.PAGE404.ABSOLUTE} />,
  },
];
