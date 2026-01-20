import styles from "./index.css";
import { registerCustomElement, setInnerHTML } from "../utils";
import CloseIcon from "../../../resources/icons/close.svg";

class RQToast extends HTMLElement {
  #shadowRoot;
  #time = 10000;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.#shadowRoot, this._getDefaultMarkup());

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  connectedCallback() {
    const heading = this.#shadowRoot.getElementById("heading");
    heading.textContent = this.attributes.getNamedItem("heading")?.value ?? null;

    const time = Number(this.attributes.getNamedItem("time")?.value) ?? null;
    if (time) {
      this.#time = time;
    }

    const iconPath = this.attributes.getNamedItem("icon-path")?.value;
    if (iconPath) {
      const iconContainer = this.#shadowRoot.getElementById("icon-container");
      const icon = document.createElement("img");
      icon.setAttribute("src", iconPath);
      iconContainer?.appendChild(icon);
    }

    this.#shadowRoot.getElementById("close-icon").addEventListener("click", this.hide);

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
        <div id="content-container">
          <slot id="content" name="content"></slot>
        </div>
     </div>
    `;
  }

  show() {
    setTimeout(() => {
      this.#shadowRoot.getElementById("container")!.classList.add("active");
      setTimeout(this.hide, this.#time);
    }, 300);
  }

  hide() {
    this.#shadowRoot.getElementById("container")!.classList.remove("active");
  }
}

registerCustomElement("rq-toast", RQToast);
