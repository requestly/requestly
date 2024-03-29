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
          title: "Mock Server",
          enabled: true,
        },
        {
          title: "API Client",
          enabled: true,
        },
        {
          title: "Community Support",
          enabled: true,
        },
        {
          title: "Non-Commercial Use Only",
          enabled: true,
        },
      ],
    },
    basic: {
      planTitle: "Basic",
      heading: "For individuals",
      features: [
        {
          title: "10 rules (5 active)",
          enabled: true,
          tooltip: "You can create upto 10 rules where 5 rules can be active at a time.",
        },
        {
          title: "Modify API request and response",
          enabled: true,
          tooltip: "Statically override the payload with content of up to 1500 characters",
        },
        {
          title: "GraphQL API Modifications",
          enabled: true,
        },
        {
          title: "Script injection",
          enabled: true,
        },
        {
          title: "Email + Chat Support",
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
          title: "Unlimited active rules",
          enabled: true,
        },
        {
          title: "Collaborate with teammates",
          enabled: true,
        },
        {
          title: "Unlimited mocks",
          enabled: true,
        },
        {
          title: "Daily backups(Encrypted)",
          enabled: true,
        },
        {
          title: "Email + Chat Support",
          enabled: true,
        },
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
          title: "User Access Management (Map your organization)",
          enabled: true,
        },
        {
          title: "API access",
          enabled: true,
        },
        {
          title: "SLAs (Support, Service Uptime, Insurance)",
          enabled: true,
          visibleInPricingPageOnly: true,
        },
        {
          title: "SSO identity management & SAML",
          enabled: true,
        },
        {
          title: "Pay by invoice",
          enabled: true,
          visibleInPricingPageOnly: true,
        },
        {
          title: "Enterprise grade security & compliance (GDPR, SOC2)",
          enabled: true,
        },
        {
          title: "Priority Support - Slack Connect, Email, Chat",
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
