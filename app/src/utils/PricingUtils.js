export const defaultCurrency = "USD";
export const defaultCountry = "US";

export const paypalClientId = "AaORQLcfr4mtfVD4txtvqn723JIUJ1vCzlQ358CTCiGaqBttyZquK7UmuUu5l4Gma12ikrP8FztIECQt";

export const getDurationTitleFromDays = (days) => {
  switch (parseInt(days)) {
    case 30:
      return "monthly";
    case 90:
      return "quarterly";
    case 180:
      return "half-yearly";
    case 365:
      return "annually";
    default:
      return false;
  }
};

export const getDurationUnitFromDays = (days) => {
  switch (parseInt(days)) {
    case 30:
      return "month";
    case 365:
      return "year";
    default:
      return "month";
  }
};

export const getDaysFromDurationTitle = (durationTitle) => {
  switch (durationTitle) {
    case "monthly":
      return 30;
    case "quarterly":
      return 90;
    case "half-yearly":
      return 180;
    case "annual":
      return 365;
    default:
      return 30;
  }
};

export const currencyOptionsObject = {
  MX: "MXN",
  GB: "GBP",
  EU: "EUR",
  US: "USD",
  CA: "CAD",
  CN: "CNY",
};

export const getCurrencySymbol = (country, currency) => {
  let currencyCode;
  if (!currency && country) {
    currencyCode = getDefaultCurrencyBasedOnLocation(country);
  } else {
    currencyCode = currency;
  }
  switch (currencyCode) {
    case "MXN":
      return "Mex$";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "CAD":
      return "C$";
    case "CNY":
      return "CN¥";

    default:
      return currencyCode;
  }
};

export const getDefaultCurrencyBasedOnLocation = (countryCode) => {
  return currencyOptionsObject[countryCode] || defaultCurrency;
};

export const getPlanCategory = (mode) => {
  switch (mode) {
    case "team":
      return "enterprise";
    case "individual":
      return "gold";
    default:
      return "individual";
  }
};

export const beautifySubscriptionStatus = (subscriptionStatus) => {
  switch (subscriptionStatus) {
    case "active":
      return "Active";
    case "incomplete":
    case "unpaid":
      return "Payment pending";
    case "incomplete_expired":
      return "Payment Unsuccessful";
    case "trialing":
      return "Active Trial Period";
    case "past_due":
      return "Past due";
    case "canceled":
      return "Cancelled";
    default:
      return "Contact us";
  }
};

export const beautifySubscriptionType = (subscriptionType) => {
  switch (subscriptionType) {
    case "team":
      return "Team Subscription";
    case "unlock":
      return "Unlocked Subscription";
    case "license":
      return "Enterprise Plan";
    case "paypal":
      return "Paypal Subscription";
    case "individual":
      return "Personal Subscription";
    case "trial":
      return "Free Trial";
    case "producthunt":
      return "Producthunt Unlock";
    case "appsumo":
      return "AppSumo";
    default:
      return "Premium Plan";
  }
};
