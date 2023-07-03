//@ts-ignore
import styles from "./toast.css";
import CloseIcon from "../../../resources/icons/close.svg";

class RQToast extends HTMLElement {
  time = 5000;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this._getDefaultMarkup();

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  connectedCallback() {
    const heading = this.shadowRoot.getElementById("heading");
    const subheading = this.shadowRoot.getElementById("subheading");

    heading.textContent = this.attributes.getNamedItem("heading")?.value ?? null;
    subheading.textContent = this.attributes.getNamedItem("subheading")?.value ?? null;

    const time = Number(this.attributes.getNamedItem("time")?.value) ?? null;
    if (time) {
      this.time = time;
    }

    const iconPath = this.attributes.getNamedItem("icon-path")?.value;
    if (iconPath) {
      const iconContainer = this.shadowRoot.getElementById("icon-container");
      const icon = document.createElement("img");
      icon.setAttribute("src", iconPath);
      iconContainer?.appendChild(icon);
    }

    this.shadowRoot.getElementById("close-icon").addEventListener("click", this.hide);

    this.show();
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="container">
        <div id="heading-container">
          <div>
            <div id="icon-container"></div>
            <div id="heading"></div>
          </div>
          <div id="close-icon">${CloseIcon}</div>
        </div>
        <div id="subheading-container">
          <div id="subheading"></div>
        </div>
     </div>
    `;
  }

  show() {
    setTimeout(() => {
      this.shadowRoot.getElementById("container")!.classList.add("active");
      setTimeout(this.hide, this.time);
    }, 300);
  }

  hide() {
    this.shadowRoot.getElementById("container")!.classList.remove("active");
  }
}

export const registerRQToast = () => {
  customElements.get("rq-toast") ?? customElements.define("rq-toast", RQToast);
};
