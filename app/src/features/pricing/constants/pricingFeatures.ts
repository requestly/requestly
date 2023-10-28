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
          title: "Unlimited header modifications",
          enabled: true,
          tooltip:
            "There is no limit on header modification rules; they only count as one towards your total rule limit.",
        },
        {
          title: "Modify API request and response",
          enabled: true,
          tooltip: "Statically override the payload with content of up to 1500 characters",
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
          title: "GraphQL API Modifications",
          enabled: true,
        },
        {
          title: "Programmatically modify API request and response",
          enabled: true,
          tooltip: "Statically and programmatically override the response without any character limits.",
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
          title: "User management & access control",
          enabled: true,
        },
        {
          title: "Daily backups(Encrypted)",
          enabled: true,
        },
        {
          title: "Priority Support - Slack Connect, Email, Chat",
          enabled: true,
        },
      ],
    },
    enterprise: {
      planTitle: "Enterprise",
      planDescription:
        "Empower your team with our Enterprise Plan, designed to seamlessly scale with your ambitions and drive collaborative success",
      features: [
        {
          title: "API access",
          enabled: true,
        },
        {
          title: "Single Sign On",
          enabled: true,
        },
        {
          title: "Unlimited Everything",
          enabled: true,
        },
        {
          title: "User management & access control",
          enabled: true,
        },
        {
          title: "On Premise support",
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
      planTitle: "Professional",
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
