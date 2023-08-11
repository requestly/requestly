import React, { useState } from "react";
import { Button, Form, FormGroup, Input, InputGroup } from "reactstrap";
import { getFunctions, httpsCallable } from "firebase/functions";
//ICONS
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import { trackCouponAppliedFailure, trackCouponAppliedSuccess } from "modules/analytics/events/misc/coupon";

const ApplyCouponBox = ({ setCouponDiscountValue, couponCodeText, setCouponCodeText }) => {
  //Component State
  const [isApplied, setIsApplied] = useState(false);
  const [descriptionMessage, setDescriptionMessage] = useState("");
  const [isBeingApplied, setIsBeingApplied] = useState(false);

  const isErrorMode = descriptionMessage && !isApplied;
  const isSuccessMode = descriptionMessage && isApplied;

  const handleCouponBoxOnChange = (e) => {
    setCouponCodeText(e.target.value);
  };

  const handleApplyCoupon = () => {
    // ignore if empty box
    if (!couponCodeText) {
      setIsApplied(false);
      setDescriptionMessage("");
      setIsBeingApplied(false);
      return;
    }

    // render loading spinner
    setIsBeingApplied(true);
    const functions = getFunctions();
    const getCouponDiscount = httpsCallable(functions, "getCouponDiscount");

    getCouponDiscount({ coupon: couponCodeText }).then((result) => {
      const discountPercentage = result.data;
      if (typeof discountPercentage === "number" && discountPercentage !== 0) {
        setIsApplied(true);
        setDescriptionMessage(`${discountPercentage}% OFF`);
        setIsBeingApplied(false);
        trackCouponAppliedSuccess(couponCodeText, discountPercentage);
      } else {
        setIsApplied(false);
        setDescriptionMessage("Invalid coupon code.");
        setIsBeingApplied(false);
        trackCouponAppliedFailure(couponCodeText);
      }
      setCouponDiscountValue(discountPercentage, couponCodeText);
    });
  };

  const handleRemoveCoupon = () => {
    setCouponCodeText("");
    setIsApplied(false);
    setDescriptionMessage("");
    setCouponDiscountValue(0, "");
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (isApplied) {
      handleRemoveCoupon();
    } else {
      handleApplyCoupon();
    }
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <FormGroup>
        <InputGroup style={{ width: "300px" }}>
          <Input
            placeholder="Enter Coupon"
            className={[isErrorMode ? "is-invalid" : "", isSuccessMode ? "is-valid" : ""].join(" ")}
            value={couponCodeText}
            disabled={isApplied || isBeingApplied}
            onChange={handleCouponBoxOnChange}
          />
          {isBeingApplied ? (
            <Button disabled={true}>
              <FaSpinner className="icon-spin" />
            </Button>
          ) : isApplied ? (
            <Button type="submit" color="secondary">
              Remove
            </Button>
          ) : (
            <Button type="submit" color="primary">
              Apply
            </Button>
          )}
        </InputGroup>
        {isErrorMode ? <p className="help is-danger">{descriptionMessage}</p> : null}

        {isSuccessMode ? <p className="help is-success">{descriptionMessage}</p> : null}
      </FormGroup>
    </Form>
  );
};

export default ApplyCouponBox;
