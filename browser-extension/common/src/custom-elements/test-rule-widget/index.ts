import styles from "./index.css";
import { setInnerHTML } from "../utils";
import { RQDraggableWidget } from "../abstract-classes/draggable-widget";
import RQLogo from "../../../resources/icons/rqLogo-blue.svg";
import RQLogoSmall from "../../../resources/icons/rqLogo-white.svg";
import MinimizeIcon from "../../../resources/icons/minimze.svg";
import InfoIcon from "../../../resources/icons/info.svg";
import VisibilityIcon from "../../../resources/icons/visibility.svg";
import CloseIcon from "../../../resources/icons/close.svg";

const DEFAULT_POSITION = { right: 16, top: 16 };

export abstract class RQTestRuleWidget extends RQDraggableWidget {
  constructor() {
    super(DEFAULT_POSITION);
    this.shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());
  }

  connectedCallback() {
    this.setAttribute("draggable", "true");
    super.connectedCallback();
    this.addListeners();
    this.showInfoContainer();
  }

  addListeners() {
    this.shadowRoot.getElementById("minimize-button").addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleMinimize(true);
    });

    this.shadowRoot.getElementById("test-rule-minimized-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleMinimize(false);
    });
  }

  getContainer() {
    return this.shadowRoot.getElementById("container");
  }

  show(position = DEFAULT_POSITION) {
    this.moveToPostion(position);
    this.setAttribute("draggable", "true");
    const container = this.getContainer();
    container.classList.remove("hidden");
    container.classList.add("visible");
  }

  hide() {
    this.getContainer().classList.add("hidden");
    this.getContainer().classList.remove("visible");
  }

  toggleMinimize(minimize: boolean) {
    const container = this.shadowRoot.getElementById("container");
    const minimizedDetails = this.shadowRoot.getElementById("minimized-details");
    if (minimize) {
      container.classList.add("minimized");
      minimizedDetails.classList.add("visible");
    } else {
      container.classList.remove("minimized");
      minimizedDetails.classList.remove("visible");

      // if expanded widget width is going out of screen, then  set its horizontal position to default

      const boundingRect = this.getBoundingClientRect();
      if (boundingRect.right > window.innerWidth) {
        this.moveToPostion({ right: DEFAULT_POSITION.right, top: boundingRect.top });
      }
    }
  }

  showInfoContainer() {
    const infoTextContent = this.attributes.getNamedItem("rq-test-rule-text")?.value;
    if (infoTextContent) {
      const infoContainer = this.shadowRoot.getElementById("info-container");
      const infoContainerText = this.shadowRoot.getElementById("info-text");
      setInnerHTML(infoContainerText, infoTextContent);
      infoContainer.classList.remove("hidden");
      infoContainer.classList.add("visible");
    }
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="container">
        <div id="minimized-details">
            <div id="minimized-logo">${RQLogoSmall}</div>
            <button id="test-rule-minimized-btn"></button>
        </div>
        <div id="heading-container">
            <div id="logo-container">
                <span id="heading-logo">${RQLogo}</span>
                <span id="logo-text">requestly</span>
            </div>
            <div id="actions-container">
                <button id="settings-button" class="hidden" data-tooltip="Hide widget in app settings">${VisibilityIcon}</button>
                <button id="minimize-button">${MinimizeIcon}</buttton>
                <button id="close-button" class="hidden">${CloseIcon}</buttton>
            </div>
        </div>
        <div id="test-rule-container"></div>
         <div id="info-container" class="hidden">
          <div id="info-icon">${InfoIcon}</div>
          <div id="info-text"></div>
        </div>
    </div>
    `;
  }
}
