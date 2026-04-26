import { DownloadPlatform } from "./detectOS";

export const MIGRATION_BLOCK_FLAG = "api_client_migration_block_screen";
export const MIGRATION_BLOCK_DISMISSABLE_FLAG = "api_client_migration_block_screen_dismissable";
export const MIGRATION_BLOCK_CLOUD_FORCE_FLAG = "api_client_migration_block_screen_cloud_force";

export const DOWNLOAD_URLS: Record<DownloadPlatform, string> = {
  mac_arm: "https://get.requestly.com/mac-api-client",
  mac_intel: "https://get.requestly.com/mac-intel-api-client",
  win: "https://get.requestly.com/win-api-client",
  linux: "https://get.requestly.com/linux-api-client",
};

export const DOWNLOAD_LABELS: Record<DownloadPlatform, string> = {
  mac_arm: "macOS (Apple Silicon)",
  mac_intel: "macOS (Intel)",
  win: "Windows",
  linux: "Linux",
};

export const REPORT_ISSUES_URL = "https://github.com/requestly/requestly/issues/4593";
