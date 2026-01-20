import { trackEvent } from "modules/analytics";
import { COUPON } from "./constants";

export const trackCouponAppliedSuccess = (coupon_code, coupon_discount_percentage) => {
  const params = { coupon_code, coupon_discount_percentage };
  trackEvent(COUPON.COUPON_APPLIED_SUCCESS, params);
};

export const trackCouponAppliedFailure = (coupon_code) => {
  const params = { coupon_code };
  trackEvent(COUPON.COUPON_APPLIED_FAILURE, params);
};
