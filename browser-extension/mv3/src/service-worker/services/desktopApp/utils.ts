export const getConnectedBrowserAppId = () => {
  const userAgent = navigator.userAgent?.toLowerCase();
  //@ts-ignore
  const userAgentData = navigator.userAgentData?.brands?.map((brand) => brand.brand);

  if (!userAgent) {
    return "existing-browser";
  }

  switch (true) {
    case userAgent.includes("firefox"):
      return "existing-firefox";
    case userAgent.includes("edg/"):
      return "existing-edge";
    case userAgent.includes("opr") || userAgent.includes("opera"):
      return "existing-opera";
    //@ts-ignore
    case navigator.brave || userAgent.includes("brave") || userAgentData.includes("Brave"):
      return "existing-brave";
    case userAgent.includes("chrome"):
      if (userAgentData.includes("Google Chrome")) {
        return "existing-chrome";
      } else {
        return "existing-chromium";
      }
    default:
      return "existing-browser";
  }
};
