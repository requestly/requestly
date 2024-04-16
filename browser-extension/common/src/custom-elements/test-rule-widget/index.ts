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
    this.shadowRoot.getElementById("rq-minimize-button").addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleMinimize(true);
    });

    this.shadowRoot.getElementById("rq-minimized-status-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleMinimize(false);
    });
  }

  toggleMinimize(minimize: boolean) {
    const container = this.shadowRoot.getElementById("rq-container");
    const minimizedDetails = this.shadowRoot.getElementById("rq-minimized-details");
    if (minimize) {
      container.classList.add("minimized");
      minimizedDetails.classList.add("visible");
    } else {
      container.classList.remove("minimized");
      minimizedDetails.classList.remove("visible");
    }
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="rq-container">
        <div id="rq-minimized-details">
            <div id="rq-minimized-logo">${RQLogoSmall}</div>
            <button id="rq-minimized-status-btn"></button>
        </div>
        <div id="rq-heading-container">
            <div id="rq-logo-container"> 
                <span id="rq-heading-logo">${RQLogo}</span>
                <span id="rq-logo-text">requestly</span>
            </div>
            <div id="rq-actions-container">
                <button id="rq-settings-button" class="hidden">${SettingsIcon}</button>
                <button id="rq-minimize-button">${MinimizeIcon}</buttton>
            </div>
        </div>
        <div id="rq-content-container"></div>
         <div id="rq-info-container" class="hidden">
          <div id="rq-info-icon" class="secondary-text">${InfoIcon}</div>
          <div id="rq-info-text" class="secondary-text"></div>
        </div>
    </div>
    `;
  }
}
