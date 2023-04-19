import PATHS from "config/constants/sub/paths";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PaymentFail from "views/misc/payments/paymentFail";
import PaymentSuccess from "views/misc/payments/paymentSuccess";
import Checkout from "views/misc/payments/Checkout";

const FullScreenLayout = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route path={PATHS.CHECKOUT.ABSOLUTE} element={<Checkout />}></Route>
        {/* <Route
          path={PATHS.EXTENSION_INSTALLED.ABSOLUTE}
          element={<Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />}
        ></Route> */}
        <Route path={PATHS.PAYMENT_SUCCESS.ABSOLUTE} element={<PaymentSuccess />}></Route>
        <Route path={PATHS.PAYMENT_FAIL.ABSOLUTE} element={<PaymentFail />}></Route>
        <Route path={PATHS.ANY} element={<Navigate to={PATHS.PAGE404.ABSOLUTE} />} />
      </Routes>
    </React.Fragment>
  );
};

export default FullScreenLayout;
