interface AJAXRequestDetails {
  url: string;
  method: string;
  type: "xmlhttprequest" | "fetch";
  initiatorDomain: string;
}

export const onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails) => {
  // Apply required modifications using updateSessionRules
};
