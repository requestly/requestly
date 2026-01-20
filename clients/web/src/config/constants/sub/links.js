import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { getLinkWithMetadata } from "modules/analytics/metadata";

const LINKS = {
  /** DOCS */

  // Download
  REQUESTLY_DOWNLOAD_PAGE: getLinkWithMetadata("https://requestly.com/downloads"),
  REQUESTLY_DOCS: "https://docs.requestly.com/",
  //Docs - Using Rules
  REQUESTLY_DOCS_USING_RULES: "https://docs.requestly.com/general/http-rules/overview/",
  //Docs -Sharing Rules
  REQUESTLY_DOCS_SHARING_RULES: "https://docs.requestly.com/general/http-rules/sharing",
  //Docs - File Service
  REQUESTLY_DOCS_FILES_SERVICE: "https://docs.requestly.com/general/mock-server/overview",

  // Docs - Premium Subscription
  REQUESTLY_DOCS_PREMIUM_SUBSCRIPTION: "https://docs.requestly.com/general/team/team-collaboration",

  // Docs - Premium Subscription
  REQUESTLY_DOCS_TEAM_SUBSCRIPTION: "https://docs.requestly.com/general/team/team-collaboration",

  // Docs - Mock Server
  REQUESTLY_DOCS_MOCK_SERVER: "https://docs.requestly.com/general/mock-server/overview",

  // Docs - Backup Data
  REQUESTLY_DOCS_BACKUP_DATA: "https://docs.requestly.com/general/http-rules/sharing/download-rules",

  // Docs - Extension Troubleshooting
  REQUESTLY_EXTENSION_TROUBLESHOOTING: "https://docs.requestly.com/guides/troubleshooting/rules-not-working",

  REQUESTLY_EXTENSION_RULES_NOT_WORKING: "https://docs.requestly.com/guides/troubleshooting/rules-not-working",

  // Docs - Mock GraphQL API response
  REQUESTLY_DOCS_MOCK_GRAPHQL:
    "https://docs.requestly.com/general/http-rules/advanced-usage/graphql-modify-request-response",

  // Docs - HTTP modifications
  REQUESTLY_DOCS_HTTP_MODIFICATIONS: "https://docs.requestly.com/general/http-rules/overview",

  // Docs - Source Filters
  REQUESTLY_DOCS_SOURCE_FILTERS: "https://docs.requestly.com/general/http-rules/advanced-usage/advance-targeting",

  // Docs - Import rules from charles proxy
  REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_CHARLES: "https://docs.requestly.com/general/imports/charles-proxy",

  // Docs - Import Rules from resource override
  REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_RESOURCE_OVERRIDE: "https://docs.requestly.com/general/imports/resource-override",

  // Docs - Test URL condition
  REQUESTLY_DOCS_TEST_URL_CONDITION:
    "https://docs.requestly.com/general/http-rules/others/http-rules-testing/test-url-condition",

  REQUESTLY_DOCS_SESSION_RECORDING_ARCHITECTURE: "https://docs.requestly.com/security-privacy/sessions/",

  REQUESTLY_DOCS_TEST_RULES: "https://docs.requestly.com/general/http-rules/advanced-usage/test-rules",

  REQUESTLY_API_DOCS: "https://docs.requestly.com/public-apis/overview/",

  REQUESTLY_REDIRECT_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/redirect-rule",
  REQUESTLY_CANCEL_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/cancel-rule",
  REQUESTLY_DELAY_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/delay-network-requests",
  REQUESTLY_HEADERS_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/modify-headers/",
  REQUESTLY_QUERYPARAM_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/modify-query-params",
  REQUESTLY_REPLACE_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/replace-strings",
  REQUESTLY_REQUEST_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/modify-request-body",
  REQUESTLY_RESPONSE_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/modify-request-body",
  REQUESTLY_SCRIPT_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/insert-scripts",
  REQUESTLY_USERAGENT_RULE_DOCS: "https://docs.requestly.com/general/http-rules/rule-types/modify-user-agents",
  REQUESTLY_RUNTIME_VARIABLES_DOCS:
    "https://docs.requestly.com/general/api-client/environments-and-variables/runtime-variables",

  REQUESTLY_HEADERS_RULE_FAQ_LINK:
    "https://docs.requestly.com/general/http-rules-(modify-traffic)/rule-types/modify-headers#faqs",

  REQUESTLY_NETWORK_INSPECTOR_DOCS:
    "https://docs.requestly.com/guides/inspect-traffic-and-apply-modifications-from-chrome-devtools-using-requestly",

  /** API Client docs */
  REQUESTLY_API_CLIENT_DOCS: "https://docs.requestly.com/general/api-client/overview",

  /** LANDING PAGES **/

  // Home
  REQUESTLY_LANDING_HOME: getLinkWithMetadata("https://requestly.com/"),
  //Blog
  REQUESTLY_BLOG: getLinkWithMetadata("https://requestly.com/blog/"),
  //Desktop App
  REQUESTLY_DESKTOP_APP: getLinkWithMetadata("https://requestly.com/desktop"),
  //Privacy Policy
  REQUESTLY_PRIVACY_POLICY: getLinkWithMetadata("https://requestly.com/privacy"),
  // Terms and Conditions
  REQUESTLY_TERMS_AND_CONDITIONS: getLinkWithMetadata("https://requestly.com/terms/"),
  //Privacy Statement
  REQUESTLY_PRIVACY_STATEMENT: getLinkWithMetadata("https://requestly.com/privacy/"),
  //Contact Us
  CONTACT_US: "mailto:" + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL,
  // Contact Us Page
  CONTACT_US_PAGE: getLinkWithMetadata("https://requestly.com/contact-us/"),
  // Book A Demo
  BOOK_A_DEMO: "https://www.browserstack.com/contact?utm_source=Requestly&utm_medium=redirect&utm_platform=external",

  /** SUPPORT */

  //Github Issues
  REQUESTLY_GITHUB_ISSUES: "https://github.com/requestly/customer-support/issues",
  FEEDBACK: "https://feedback.requestly.io/",

  /** EXTENSIONS */

  //Chrome
  CHROME_EXTENSION:
    "https://chromewebstore.google.com/detail/requestly-intercept-modif/mdnleldcmiljblolnjhpnblkcekpdkpa",

  CHROME_STORE_REVIEWS: "https://rqst.ly/chrome-review",
  CHROME_STORE_REVIEW_FORM: "https://app.formbricks.com/s/cmd2qhh4vnxezyq01ailfaszm",
  //Firefox
  FIREFOX_EXTENSION: "https://app.requestly.in/firefox/builds/requestly-latest.xpi",
  //Edge
  EDGE_EXTENSION:
    "https://microsoftedge.microsoft.com/addons/detail/requestly-redirect-url-/ehghoapnlpepjmfbgaomdiilchcjemak",
  /** GDPR */
  GDPR: {
    GDPR_PAGE: "https://privacy.requestly.io/",
    EXPORT_DATA: "https://privacy.requestly.io/data_requests",
    DELETE_ACCOUNT: "https://privacy.requestly.io/data_requests",
    SIGN_DPA: "https://privacy.requestly.io/dpa",
  },

  /** TUTORIALS */
  YOUTUBE_TUTORIALS: "https://rqst.ly/http-rules-yt-tutorials",
  YOUTUBE_API_CLIENT_TUTORIALS: "https://rqst.ly/tutorials",

  TUTORIALS: {
    REDIRECT_RULE: "https://rqst.ly/redirect-rule-yt",
  },

  DEMO_VIDEOS: {
    TEAM_WORKSPACES: "https://rqst.ly/team-collaboration-yt-tutorial",
  },

  DOWNLOAD_DESKTOP_APP: {
    MACOS: "https://bit.ly/rq-mac",
    WINDOWS: "https://bit.ly/rq-windows",
    LINUX: "https://bit.ly/rq-linux",
  },

  CHANGELOG: "https://rqst.ly/change-logs",
  PRODUCTLIFT_CHANGELOG: "https://requestly.productlift.dev/",

  ACCELERATOR_PROGRAM_FORM_LINK: "https://app.formbricks.com/s/cm1ewcpkt0000djs29ct7rpy2",

  GITHUB_STUDENT_PROGRAM_DOC: "https://rqst.ly/github-education",

  GITHUB_EDUCATION_PACK_LP: "https://requestly.com/github-education/",

  API_CLIENT_LOCAL_FIRST_ANNOUNCEMENT: "https://github.com/requestly/requestly/issues/2629",

  REQUESTLY_GITHUB: "https://github.com/requestly/requestly",

  OAUTH_REDIRECT_URL: `${process.env.VITE_BACKEND_BASE_URL}/oauth/authorize`,

  ACQUISITION_DETAILS: "https://rqst.ly/rq-bstack-acq",

  API_KEY_FORM: "https://app.formbricks.com/s/clryn62s316gjdeho9j03t7oa",

  AUTOMATION_DOC: "https://rqst.ly/automation",

  DOWNLOAD_CRX: "https://requestly.com/downloads/crx/",

  DOWNLOAD_CHROME_EXTENSION_ZIP: "https://rqst.ly/chrome/zip",

  SHARE_ON_LINKEDIN_FORM: "https://app.formbricks.com/s/gsfvea1k3n53is5fit337ibp",

  NOTION_PAGE_FOR_PROMOTION:
    "https://requestly.notion.site/Help-Us-Grow-Requestly-Get-4-Months-Free-25cd193f3c998015ad1dfab733e8cfd2?source=copy_link",

  AI_DOC_LINK: "https://www.browserstack.com/support/faq/browserstack-ai",
};

export default LINKS;
