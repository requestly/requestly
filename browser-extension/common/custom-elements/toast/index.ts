//@ts-ignore
import styles from "./toast.css";

class RQToast extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this._getDefaultMarkup();
  }

  connectedCallback() {
    this.setAttribute("style", "position:fixed;z-index:2147483647;width:100%;top:0;right:0;");
    const heading = this.shadowRoot?.getElementById("heading");
    const subheading = this.shadowRoot?.getElementById("subheading");
    if (heading) heading.textContent = this.attributes.getNamedItem("heading")?.value ?? null;
    if (subheading) subheading.textContent = this.attributes.getNamedItem("subheading")?.value ?? null;

    const iconPath = this.attributes.getNamedItem("icon-path")?.value;
    if (iconPath) {
      const iconContainer = this.shadowRoot?.getElementById("icon-container");
      const icon = document.createElement("img");
      icon.setAttribute("src", iconPath);
      iconContainer?.appendChild(icon);
    }

    const container = this.shadowRoot?.getElementById("container");
    if (container) {
      setTimeout(() => container.classList.add("active"), 300);
      setTimeout(() => container.classList.remove("active"), 4000);
    }
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="container">
        <div id="heading-container">
          <div id="icon-container"></div>
          <div id="heading"></div>
        </div>
        <div id="subheading-container">
          <div id="subheading"></div>
        </div>
     </div>
    `;
  }
}

export const registerRQToast = () => {
  customElements.get("rq-toast") ?? customElements.define("rq-toast", RQToast);
};
