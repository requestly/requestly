import { getBlockedDomains } from "../../utils";

export interface ProxyDetails {
  proxyPort: number;
  proxyIp: string;
  proxyUrl: string;
}

const RQBypassList = ["meet.google.com", "*.requestly.io"];

export const applyProxy = async (proxyDetails: ProxyDetails) => {
  if (!proxyDetails) {
    return;
  }

  const isApplied = await isProxyApplied();
  if (isApplied) {
    return;
  }
  const blockedDomains = await getBlockedDomains();
  const blockedSubDomains = blockedDomains.map((domain) => `*.${domain}`);

  const bypassList = [...blockedDomains, ...blockedSubDomains, ...RQBypassList];

  return (
    chrome.proxy.settings
      .set({
        value: {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host: proxyDetails.proxyIp,
              port: proxyDetails.proxyPort,
            },
            bypassList: bypassList,
          },
        },
        scope: "regular",
      })
      // @ts-ignore
      ?.then(() => {})
      ?.catch((err: unknown) => {
        console.error("Error applying proxy", err);
      })
  );
};

export const removeProxy = async () => {
  const isApplied = await isProxyApplied();
  if (!isApplied) {
    return;
  }

  return (
    chrome.proxy.settings
      .clear({ scope: "regular" })
      // @ts-ignore
      ?.catch((err: unknown) => {
        console.error("Error removing proxy", err);
      })
  );
};

export const isProxyApplied = async (): Promise<boolean> => {
  //@ts-ignore
  return chrome.proxy.settings.get({}).then((config) => {
    if (config.levelOfControl === "controlled_by_this_extension" && config.value.mode === "fixed_servers") {
      return true;
    }
    return false;
  });
};
