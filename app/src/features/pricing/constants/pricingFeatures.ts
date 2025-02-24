import { PRICING } from "./pricing";
import { PlanFeatures } from "../components/PricingTable/types";

export const PricingFeatures: PlanFeatures = {
  [PRICING.PRODUCTS.HTTP_RULES]: {
    free: {
      planTitle: "Free",
      heading: "Starter plan",
      features: [
        {
          title: "5 rules (3 active)",
          enabled: true,
          tooltip: "You can create upto 5 rules where 3 rules can be active at a time.",
        },
        {
          title: "Standard HTTP Modifications",
          enabled: true,
          tooltip:
            "Redirect requests, Replace Strings, Modify headers, Cancel requests, Modify Query Params, Delay Network Requests",
        },
        {
          title: "5 API Mocks",
          enabled: true,
        },
        {
          title: "Non-Commercial Use Only",
          enabled: true,
        },
      ],
    },
    lite: {
      planTitle: "Lite",
      heading: "For individuals",
      features: [
        {
          title: "5 rules (3 active)",
          enabled: true,
          tooltip: "You can create upto 5 rules where 3 rules can be active at a time.",
        },
        {
          title: "All HTTP Modifications",
          enabled: true,
          tooltip: "Override API responses, Modify Request Body, Insert Custom Scripts + Standard HTTP Modifications",
        },
        {
          title: "Unlimited Header Rules",
          enabled: true,
          tooltip: "There is no limit on header modification rules; they only count as one towards your total rule",
        },
        {
          title: "5 API Mocks",
          enabled: true,
        },
        {
          title: "For individual users",
          enabled: true,
        },
      ],
    },
    basic: {
      planTitle: "Basic",
      heading: "For small teams",
      features: [
        {
          title: "10 rules (5 active)",
          enabled: true,
          tooltip: "You can create upto 10 rules where 5 rules can be active at a time.",
        },
        {
          title: "All HTTP Modifications",
          enabled: true,
          tooltip: "Override API responses, Modify Request Body, Insert Custom Scripts + Standard HTTP Modifications",
        },
        {
          title: "10 API Mocks",
          enabled: true,
        },
        {
          title: "Email + Chat Support",
          enabled: true,
        },
        {
          title: "For small teams",
          enabled: true,
        },
      ],
    },
    professional: {
      planTitle: "Professional",
      heading: "For collaboration in teams",
      features: [
        {
          title: "Unlimited rules",
          enabled: true,
        },
        {
          title: "Unlimited mocks",
          enabled: true,
        },
        {
          title: "Collaborate with teammates",
          enabled: true,
        },
        {
          title: "Daily backups (Encrypted)",
          enabled: true,
        },
        { title: "Priority Support (Slack Connect and Email)", enabled: true },
      ],
    },
    enterprise: {
      planTitle: "Enterprise",
      features: [
        {
          title: "Unlimited everything",
          enabled: true,
        },
        {
          title: "Complete access to the API client",
          enabled: true,
        },
        {
          title: "API access",
          enabled: true,
        },
        {
          title: "SSO & SAML",
          enabled: true,
        },
        {
          title: "Security & compliance (GDPR, SOC2)",
          enabled: true,
        },
        {
          title: "User Access Management",
          enabled: true,
        },
        {
          title: "Enterprise grade security & compliance (GDPR, SOC2)",
          enabled: true,
        },
        { title: "SLAs (Support, Service Uptime, Insurance)", enabled: true, visibleInPricingPageOnly: true },
        { title: "Pay by invoice", enabled: true, visibleInPricingPageOnly: true },
      ],
    },
  },
  [PRICING.PRODUCTS.API_CLIENT]: {
    free: {
      planTitle: "Free",
      heading: "Everything you need for <br/> individuals and small teams",
      features: [
        {
          title: "Unlimited collections and environments",
          enabled: true,
        },
        {
          title: "Unlimited collection runs",
          enabled: true,
        },
        {
          title: "Unlimited collaborators",
          enabled: true,
        },
        {
          title: "Unlimited local workspaces",
          enabled: true,
        },
        {
          title: "Unlimited team workspaces",
          enabled: true,
        },
        {
          title: "Git Integration",
          enabled: true,
        },
      ],
    },
    [PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE]: {
      planTitle: "Enterprise",
      heading: "For Org-wide secure and <br/> controlled API development.",
      features: [
        {
          title: "Role-based access control",
          enabled: true,
        },
        {
          title: "SSO & SAML",
          enabled: true,
        },
        {
          title: "SLAs (Service Uptime, Insurance)",
          enabled: true,
        },
        {
          title: "SOC2 Reports",
          enabled: true,
        },
        {
          title: "Pay by invoice",
          enabled: true,
        },
      ],
    },
  },
  [PRICING.PRODUCTS.SESSION_REPLAY]: {
    free: {
      planTitle: "Free",
      features: [
        {
          title: "10 sessions",
          enabled: true,
        },
        {
          title: "Network logs",
          enabled: true,
        },
        {
          title: "Console logs",
          enabled: true,
        },
        {
          title: "Environment details",
          enabled: true,
        },
        {
          title: "Resend requests (coming soon)",
          enabled: true,
        },
        {
          title: "Compare HTTP Responses (Coming Soon)",
          enabled: true,
        },
      ],
    },
    session_professional: {
      planTitle: "Plus",
      features: [
        {
          title: "Unlimited sessions",
          enabled: true,
        },
        {
          title: "Download session file",
          enabled: true,
        },
        {
          title: "Collaborate with teammates",
          enabled: true,
        },
        {
          title: "Integrations : Jira, Linear (coming soon)",
          enabled: true,
        },
        {
          title: "AI powered insights (coming soon)",
          enabled: true,
        },
      ],
    },
  },
};
