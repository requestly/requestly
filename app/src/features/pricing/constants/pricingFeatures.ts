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
          title: "Unlimited Header Rules",
          enabled: true,
          tooltip: "Header rules are free and unlimited. They don't count toward your rule usage limits",
        },
        {
          title: "5 API Mock Endpoints",
          enabled: true,
        },
        {
          title: "5 Files (JS / CSS)",
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
          title: "5 API Mock Endpoints",
          enabled: true,
        },
        {
          title: "5 Files (JS / CSS)",
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
          title: "10 API Mock Endpoints",
          enabled: true,
        },
        {
          title: "10 Files (JS / CSS)",
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
          title: "Unlimited Rules",
          enabled: true,
        },
        {
          title: "Unlimited Groups",
          enabled: true,
        },
        {
          title: "Unlimited Mock Endpoints",
          enabled: true,
        },
        {
          title: "Unlimited Files (JS / CSS)",
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
      heading: "All you need for individual & small teams",
      features: [
        {
          title: "API Client",
          enabled: true,
        },
        {
          title: "Unlimited Collections",
          enabled: true,
        },
        {
          title: "Unlimited Environments",
          enabled: true,
        },
        {
          title: "Unlimited API Tests",
          enabled: true,
        },
        {
          title: "Git-Based Collaboration",
          enabled: true,
        },
        {
          title: "Unlimited Local workspaces",
          enabled: true,
        },
        {
          title: "3 Team Workspaces",
          enabled: true,
        },
        {
          title: "10 Team Collaborators",
          enabled: true,
        },
        {
          title: "100 Collection Runs",
          enabled: true,
        },
        {
          title: "Scripting",
          enabled: true,
        },
        {
          title: "Unlimited NPM packages",
          enabled: true,
        },
        {
          title: "3 Custom Packages",
          enabled: true,
        },
        {
          title: "Import from Postman",
          enabled: true,
        },
        {
          title: "Import OpenAPI Spec",
          enabled: true,
        },
        {
          title: "Import Collections from Git",
          enabled: true,
        },
      ],
    },
    [PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL]: {
      planTitle: "Professional",
      heading: "For collaboration in teams",
      features: [
        {
          title: "Unlimited Workspaces",
          enabled: true,
        },
        {
          title: "Unlimited Collaborators",
          enabled: true,
        },
        {
          title: "Unlimited Collection Runs",
          enabled: true,
        },
        {
          title: "Unlimited Script Packages",
          enabled: true,
        },
        {
          title: "AI-Powered API Testing",
          enabled: true,
        },
        {
          title: "Test Reports",
          enabled: true,
        },
        {
          title: "AWS Secrets Manager Integration",
          enabled: true,
        },
        {
          title: "SOC2 Report",
          enabled: true,
        },
        {
          title: "Pay by Card/Invoice",
          enabled: true,
        },
        {
          title: "Priority Support",
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
