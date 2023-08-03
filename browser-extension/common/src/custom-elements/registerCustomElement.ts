export const registerCustomElement = (tagName: string, elementConstructor: CustomElementConstructor) => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementConstructor);
  }
};
