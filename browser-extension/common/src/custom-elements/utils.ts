export const registerCustomElement = (tagName: string, elementConstructor: CustomElementConstructor) => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementConstructor);
  }
};

export const setInnerHTML = (element: InnerHTML, content: string) => {
  try {
    element.innerHTML = content;
  } catch (e) {
    // @ts-ignore
    const trustedTypesPolicy = window.trustedTypes?.createPolicy?.("rq-html-policy", {
      createHTML: (html: string) => html,
    });
    element.innerHTML = trustedTypesPolicy.createHTML(content);
  }
};

export const getEpochToMMSSFormat = (epochTime: number) => {
  const date = new Date(epochTime);
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};
