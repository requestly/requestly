import styles from "./index.css";
import { setInnerHTML } from "../utils";
import { RQDraggableWidget } from "../abstract-classes/draggable-widget";
import RQLogo from "../../../resources/icons/rqLogo-blue.svg";
import RQLogoSmall from "../../../resources/icons/rqLogo-white.svg";
import MinimizeIcon from "../../../resources/icons/minimze.svg";
import InfoIcon from "../../../resources/icons/info.svg";
import SettingsIcon from "../../../resources/icons/settings.svg";

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
                <button id="settings-button" class="hidden">${SettingsIcon}</button>
                <button id="minimize-button">${MinimizeIcon}</buttton>
            </div>
        </div>
        <div id="test-rule-container"></div>
         <div id="info-container" class="hidden">
          <div id="info-icon" class="secondary-text">${InfoIcon}</div>
          <div id="info-text" class="secondary-text"></div>
        </div>
    </div>
    `;
  }
}
