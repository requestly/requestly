import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const LINKS = {
  /** DOCS */

  // Download
  REQUESTLY_DOWNLOAD_PAGE: "https://requestly.io/downloads",
  REQUESTLY_DOCS: "https://docs.requestly.io/",
  //Docs - Using Rules
  REQUESTLY_DOCS_USING_RULES: "https://docs.requestly.io/using-rules/",
  //Docs -Sharing Rules
  REQUESTLY_DOCS_SHARING_RULES: "https://docs.requestly.io/managing-rules/sharing",
  //Docs - File Service
  REQUESTLY_DOCS_FILES_SERVICE: "https://docs.requestly.io/library/introduction-to-library",

  // Docs - Premium Subscription
  REQUESTLY_DOCS_PREMIUM_SUBSCRIPTION: "https://docs.requestly.io/premium-subscription",

  // Docs - Premium Subscription
  REQUESTLY_DOCS_TEAM_SUBSCRIPTION: "https://docs.requestly.io/premium-subscription#for-teams",

  // Docs - Mock Server
  REQUESTLY_DOCS_MOCK_SERVER: "https://docs.requestly.io/using-rules/mock-server",

  // Docs - Backup Data
  REQUESTLY_DOCS_BACKUP_DATA: "https://docs.requestly.io/managing-rules/backup-and-restore",

  // Docs - Extension Troubleshooting
  REQUESTLY_EXTENSION_TROUBLESHOOTING: "https://docs.requestly.io/troubleshooting",
  // Docs - Mock GraphQL API response
  REQUESTLY_DOCS_MOCK_GRAPHQL: "https://docs.requestly.io/using-rules/mock-graphql-api-response",
  // Docs - Android Debugger Overview
  REQUESTLY_DOCS_ANDROID_DEBUGGER: "https://docs.requestly.io/android-debugger/overview",

  // Docs - HTTP modifications
  REQUESTLY_DOCS_HTTP_MODIFICATIONS: "https://docs.requestly.io/browser-extension/chrome/http-modifications/overview",

  // Docs - Source Filters
  REQUESTLY_DOCS_SOURCE_FILTERS: "https://docs.requestly.io/browser-extension/chrome/features/advance-targeting",

  // Docs - Import rules from charles proxy (desktop only)
  REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_CHARLES:
    "https://docs.requestly.io/desktop-app/mac/features/import-settings-from-charles",

  /** LANDING PAGES **/

  // Home
  REQUESTLY_LANDING_HOME: "https://requestly.io/",
  //Blog
  REQUESTLY_BLOG: "https://requestly.io/blog/",
  //Desktop App
  REQUESTLY_DESKTOP_APP: "https://requestly.io/desktop",
  //Privacy Policy
  REQUESTLY_PRIVACY_POLICY: "https://requestly.io/privacy",
  // Terms and Conditions
  REQUESTLY_TERMS_AND_CONDITIONS: "https://requestly.io/terms/",
  //Contact Us
  CONTACT_US: "mailto:" + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL,
  // Contact Us Page
  CONTACT_US_PAGE: "https://requestly.io/contact-us/",

  /** SUPPORT */

  //Github Issues
  REQUESTLY_GITHUB_ISSUES: "https://github.com/requestly/customer-support/issues",
  FEEDBACK: "https://feedback.requestly.io/",

  /** EXTENSIONS */

  //Chrome
  CHROME_EXTENSION: "https://chrome.google.com/webstore/detail/requestly/mdnleldcmiljblolnjhpnblkcekpdkpa",

  CHROME_STORE_REVIEWS:
    "https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/reviews",
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

  /** MARKETTING */
  PRODUCT_HUNT: {
    MOBILE_INTERCEPTOR: "https://www.producthunt.com/posts/requestly-for-android",
  },

  /** TUTORIALS */
  YOUTUBE_TUTORIALS: "https://www.youtube.com/playlist?list=PLmHjVvTu_7ddFIIT9AkZ7p0lrC5gBuyb6",

  TUTORIALS: {
    REDIRECT_RULE: "https://youtu.be/lOt1kGKTq-w",
  },

  DEMO_VIDEOS: {
    TEAM_WORKSPACES: "https://www.youtube.com/watch?v=aooZB0eWAbU",
  },

  DOWNLOAD_DESKTOP_APP: {
    MACOS: "https://bit.ly/rq-mac",
    WINDOWS: "https://bit.ly/rq-windows",
    LINUX: "https://bit.ly/rq-linux",
  },
};

export default LINKS;
