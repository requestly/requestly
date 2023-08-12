import APP_CONSTANTS from "config/constants";

export const Plans = {
  [APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES]: {
    [APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC]: [
      {
        title: "10 rules (3 active)",
        enabled: true,
      },
      {
        title: "Modify headers",
        enabled: true,
      },
      {
        title: "Modify APIs request & response",
        enabled: true,
      },
      {
        title: "Mock server",
        enabled: true,
      },
      {
        title: "Session replays",
        enabled: true,
      },
    ],
    [APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL]: [
      {
        title: "Unlimited rules",
        enabled: true,
      },
      {
        title: "Team workspaces",
        enabled: true,
      },
      {
        title: "User management & access control",
        enabled: true,
      },
      {
        title: "Daily backups",
        enabled: true,
      },
      {
        title: "Script, Response Modifications",
        enabled: true,
      },
    ],
  },
  [APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY]: {
    [APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC]: [
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
    [APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL]: [
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
};
