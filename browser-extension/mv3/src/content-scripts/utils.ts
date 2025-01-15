export const cloneDetails = (details: Record<string, any>) => {
  // In firefox to share data between content script and page script we need to clone the details object using cloneInto
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#cloneinto
  //@ts-ignore
  if (typeof cloneInto !== "undefined") {
    //@ts-ignore
    return cloneInto(details, window);
  }
  return details;
};
