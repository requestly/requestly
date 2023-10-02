import APP_CONSTANTS from "config/constants";

export const PricingFeatures = {
  [APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES]: {
    free: {
      planTitle: "Free",
      heading: "Starter Plan",
      features: [
        {
          title: "10 rules",
          enabled: true,
        },
        {
          title: "Upto 3 active rules",
          enabled: true,
        },
        {
          title: "Unlimited header modifications",
          enabled: true,
        },
        {
          title: "Modify API request and response",
          enabled: true,
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
          title: "Team Workspace(in beta)",
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
          title: "Upto 25 rules",
          enabled: true,
        },
        {
          title: "Upto 10 active rules",
          enabled: true,
        },
        {
          title: "Shared list",
          enabled: true,
        },
        {
          title: "File import/exports",
          enabled: true,
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
          title: "API request/response body(Programmatic override)",
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
      heading: "For collaboration in QA & dev teams",
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
  },
  [APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY]: {
    free: {
      planTitle: "Free",
      features: [
        {
          title: "10 sessions",
          enabled: true,
        },
        {
          title: "Complete network logs",
          enabled: true,
        },
        {
          title: "Share a link",
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
          title: "Team Workspace (beta)",
          enabled: true,
        },
        {
          title: "Integraions : Jira, Linear (coming soon)",
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
