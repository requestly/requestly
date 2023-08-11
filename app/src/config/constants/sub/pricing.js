import countryCodes from "./static/countryCodes";

const PRICING = {};

PRICING.CHECKOUT = {};

PRICING.CHECKOUT.MODES = {};

PRICING.CHECKOUT.MODES.INDIVIDUAL = "individual";
PRICING.CHECKOUT.MODES.TEAM = "team";
PRICING.CHECKOUT.MODES.TRIAL = "trial";

PRICING.PLAN_NAMES = {};

PRICING.PLAN_NAMES.BRONZE = "bronze";
PRICING.PLAN_NAMES.SILVER = "silver";
PRICING.PLAN_NAMES.GOLD = "gold";
PRICING.PLAN_NAMES.LITE = "lite";
PRICING.PLAN_NAMES.BASIC = "basic";
PRICING.PLAN_NAMES.PROFESSIONAL = "professional";
PRICING.PLAN_NAMES.ENTERPRISE = "enterprise";
PRICING.PLAN_NAMES.BASIC_ENTERPRISE = "basic_enterprise";
PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE = "professional_enterprise";
PRICING.PLAN_NAMES.TRIAL_EXPIRED = "trial_expired";
PRICING.PLAN_NAMES.FREE = "free";
PRICING.PLAN_NAMES.INDIVIDUAL = "individual";

PRICING.COUNTRY_CODES = countryCodes;

PRICING.PLAN_HEADERS = {};

PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.BRONZE] = "Free";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.FREE] = "Free";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.INDIVIDUAL] = "Free";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.SILVER] = "Personal";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.GOLD] = "Personal";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.LITE] = "Lite";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.BASIC] = "Free";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.PROFESSIONAL] = "Pro";
PRICING.PLAN_HEADERS[PRICING.PLAN_NAMES.ENTERPRISE] = "Team";

PRICING.PREMIUM_PLANS = [
  PRICING.PLAN_NAMES.SILVER,
  PRICING.PLAN_NAMES.GOLD,
  PRICING.PLAN_NAMES.LITE,
  PRICING.PLAN_NAMES.BASIC,
  PRICING.PLAN_NAMES.PROFESSIONAL,
  PRICING.PLAN_NAMES.ENTERPRISE,
  PRICING.PLAN_NAMES.BASIC_ENTERPRISE,
  PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE,
];

export default PRICING;
