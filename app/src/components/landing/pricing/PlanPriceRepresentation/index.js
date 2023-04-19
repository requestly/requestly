import React from "react";
import { Typography } from "antd";
// UTILS
import { getCurrencySymbol } from "../../../../utils/PricingUtils";
// CONST
import APP_CONSTANTS from "../../../../config/constants";

const { Text } = Typography;

export default function PlanPriceRepresentation({ currency, price, duration, showOnlyExactAmount, plan }) {
  const getEnterprisePrice = () => {
    return +price;
  };

  if (Number(price) === 0) {
    return (
      <>
        <h1 style={{ textAlign: "center", marginBottom: 0 }}>
          <span
            style={{
              verticalAlign: "super",
              marginRight: "1%",
              fontSize: "1.5rem",
            }}
          >
            {getCurrencySymbol(null, currency)}
          </span>
          <span style={{ fontSize: "3rem" }}>{"0"}</span>
          <span>/month</span>
        </h1>
        {/* To align with others below h1 added but made invisible */}
        {duration === "monthly" ? null : (
          <h4
            style={{
              textIndent: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {getCurrencySymbol(null, currency)}
          </h4>
        )}
      </>
    );
  } else if (duration === "monthly") {
    return (
      <>
        <h1 style={{ textAlign: "center", marginBottom: 0 }}>
          <span
            style={{
              verticalAlign: "super",
              marginRight: "1%",
              fontSize: "1.5rem",
            }}
          >
            {getCurrencySymbol(null, currency)}
          </span>
          {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE ? (
            <span style={{ fontSize: "3rem" }}>{getEnterprisePrice()}</span>
          ) : (
            <span style={{ fontSize: "3rem" }}>{+price}</span>
          )}
          <span>
            /month
            {/* TO SHOW '/user' ONLY TO ENTERPRISE PLAN COLUMN */}
            {/* {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE
              ? "/user"
              : null} */}
          </span>
        </h1>
        {/* {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE ? (
          <>
            <div style={{ textAlign: "center" }}>
              <Text type="secondary">
                {getCurrencySymbol(null, currency)}
                {getEnterprisePrice(usersCount) * usersCount} for {usersCount}{" "}
                users
              </Text>
            </div>
          </>
        ) : null} */}
      </>
    );
  } else if (duration === "quarterly") {
    return (
      <React.Fragment>
        {showOnlyExactAmount ? (
          <h1 style={{ textAlign: "center" }}>
            <span
              style={{
                verticalAlign: "super",
                marginRight: "1%",
                fontSize: "1.5rem",
              }}
            >
              {getCurrencySymbol(null, currency)}
            </span>
            {+price}
            <span>/quarter</span>
          </h1>
        ) : (
          <React.Fragment>
            <h1 style={{ textAlign: "center" }}>
              <span
                style={{
                  verticalAlign: "super",
                  marginRight: "1%",
                  fontSize: "1.5rem",
                }}
              >
                {getCurrencySymbol(null, currency)}
              </span>
              {+Math.floor(+price / 3)}
              <span>/month</span>
            </h1>
            <h1>
              {getCurrencySymbol(null, currency)}
              <b>{+price}</b> /quarter
            </h1>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  } else if (duration === "half-yearly") {
    return (
      <React.Fragment>
        {showOnlyExactAmount ? (
          <h1 style={{ textAlign: "center" }}>
            <span
              style={{
                verticalAlign: "super",
                marginRight: "1%",
                fontSize: "1.5rem",
              }}
            >
              {getCurrencySymbol(null, currency)}
            </span>
            {+price}
            <span className="period">/six months</span>
          </h1>
        ) : (
          <React.Fragment>
            <h1 style={{ textAlign: "center" }}>
              <span
                className="period"
                style={{
                  verticalAlign: "super",
                  marginRight: "1%",
                  fontSize: "1.5rem",
                }}
              >
                {getCurrencySymbol(null, currency)}
              </span>
              {+Math.floor(+price / 6)}
              <span>/month</span>
            </h1>
            <h1 style={{ textAlign: "center" }}>
              {getCurrencySymbol(null, currency)}
              <b>{+price}</b> /six months
            </h1>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  } else if (duration === "annual") {
    return (
      <React.Fragment>
        {showOnlyExactAmount ? (
          <>
            <h1 style={{ textAlign: "center", marginBottom: 0 }}>
              <span
                style={{
                  verticalAlign: "super",
                  marginRight: "1%",
                  fontSize: "1.5rem",
                }}
              >
                {getCurrencySymbol(null, currency)}
              </span>
              <span style={{ fontSize: "3rem" }}>{+price}</span>
              <span>/year</span>
            </h1>
            <h4 style={{ textAlign: "center" }}>
              <Text type="secondary">Use Requestly at scale</Text>
            </h4>
          </>
        ) : (
          <React.Fragment>
            <h1 style={{ textAlign: "center", marginBottom: 0 }}>
              <span
                style={{
                  verticalAlign: "super",
                  marginRight: "1%",
                  fontSize: "1.5rem",
                }}
              >
                {getCurrencySymbol(null, currency)}
              </span>
              <span style={{ fontSize: "3rem" }}>
                {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE
                  ? +Math.floor(getEnterprisePrice() / 12)
                  : +Math.floor(+price / 12)}
              </span>
              <span>
                /month
                {/* TO SHOW '/user' ONLY TO ENTERPRISE PLAN COLUMN */}
                {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE ? "/user" : null}
              </span>
            </h1>
            <h4 style={{ textAlign: "center" }}>
              ~ {getCurrencySymbol(null, currency)}
              <b>{plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE ? getEnterprisePrice() : +price}</b>
              /year
              {/* TO SHOW '/user' ONLY TO ENTERPRISE PLAN COLUMN */}
              {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE ? "/user" : null}
            </h4>
            {/* {plan.id === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE ? (
              <>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary">
                    {getCurrencySymbol(null, currency)}
                    {getEnterprisePrice(usersCount) * usersCount} for{" "}
                    {usersCount} users
                  </Text>
                </div>
              </>
            ) : null} */}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
