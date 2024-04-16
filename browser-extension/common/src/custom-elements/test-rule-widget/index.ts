import styles from "./index.css";
import { registerCustomElement, setInnerHTML } from "../utils";
import { RQDraggableWidget } from "../abstract-classes/draggable-widget";
import InfoIcon from "../../../resources/icons/info.svg";
import RQLogo from "../../../resources/icons/rqLogo-blue.svg";
import RQLogoSmall from "../../../resources/icons/rqLogo-white.svg";
import MinimizeIcon from "../../../resources/icons/minimze.svg";
import CheckIcon from "../../../resources/icons/check.svg";
import PendingIcon from "../../../resources/icons/pending.svg";

enum RQTestRuleWidgetEvent {
  VIEW_RESULTS = "view-results",
}

const TAG_NAME = "rq-test-rule-widget";
const DEFAULT_POSITION = { right: 16, top: 16 };

class RQTestRuleWidget extends RQDraggableWidget {
  #testRuleId: string;

  constructor() {
    super(DEFAULT_POSITION);
    this.shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());
  }

  connectedCallback() {
    this.setAttribute("draggable", "true");
    super.connectedCallback();
    this.addListeners();

    this.#testRuleId = this.attributes.getNamedItem("rule-id")?.value;

    const ruleName = this.shadowRoot.getElementById("rule-name");
    ruleName.textContent = "Testing " + this.attributes.getNamedItem("rule-name")?.value ?? null;

    const appliedStatus = this.attributes.getNamedItem("applied-status")?.value;
    this.showRuleAppliedStatus(appliedStatus === "true");

    const infoTextContent = this.attributes.getNamedItem("info-text-content")?.value;
    if (infoTextContent) {
      const infoContainer = this.shadowRoot.getElementById("info-container");
      const infoContainerText = this.shadowRoot.getElementById("info-text");
      setInnerHTML(infoContainerText, infoTextContent);
      infoContainer.classList.remove("hidden");
    }
  }

  addListeners() {
    this.shadowRoot.getElementById("view-result-btn").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQTestRuleWidgetEvent.VIEW_RESULTS);
    });

    this.addEventListener("new-rule-applied", (evt: CustomEvent) => {
      if (evt.detail?.appliedRuleId === this.#testRuleId) {
        this.setAttribute("applied-status", "true");
        this.showRuleAppliedStatus(true);
      }
    });

    this.shadowRoot.getElementById("minimize-button").addEventListener("click", () => {
      this.toggleMinimize(true);
    });

    this.shadowRoot.getElementById("minimized-status-btn").addEventListener("click", () => {
      this.toggleMinimize(false);
    });
  }

  triggerEvent(name: RQTestRuleWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  showRuleAppliedStatus(appliedStatus: boolean) {
    const ruleStatusContainer = this.shadowRoot.getElementById("rule-status");
    const minimizedStatusBtn = this.shadowRoot.getElementById("minimized-status-btn");
    if (appliedStatus) {
      setInnerHTML(
        ruleStatusContainer,
        `
        <span>${CheckIcon}</span>
        <span id="rule-applied-status">RULE APPLIED</span>
        `
      );

      setInnerHTML(
        minimizedStatusBtn,
        `
        <span class="rq-success">${CheckIcon}</span>
      `
      );
    } else {
      setInnerHTML(
        ruleStatusContainer,
        `
        <span>${PendingIcon}</span>
        <span id="rule-not-applied-status">RULE NOT APPLIED YET</span>
        `
      );
      setInnerHTML(
        minimizedStatusBtn,
        `
        <span class="rq-warning">${PendingIcon}</span>
      `
      );
    }
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
    }
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="container">
      <div id="minimized-details">
        <div id="minimized-logo">${RQLogoSmall}</div>
        <button id="minimized-status-btn"></button>
      </div>
      <div id="heading-container">
        <div id="logo-container"> 
          <span id="heading-logo">${RQLogo}</span>
          <span id="logo-text">requestly</span>
        </div>
        <div id="actions-container">
         <button id="minimize-button">${MinimizeIcon}</buttton>
        </div>
      </div>
      <div id="content-container">
         <div id="rule-status-container">
          <div id="rule-status"></div>
        </div>
        <div id="test-rule-details">
          <div id="rule-name" class="primary-text"></div>
          <button id="view-result-btn">View Results</button>
        </div>
      </div>
        <div id="info-container" class="hidden">
          <div id="info-icon" class="secondary-text">${InfoIcon}</div>
          <div id="info-text" class="secondary-text"></div>
        </div>
    </div>
    `;
  }
}

registerCustomElement(TAG_NAME, RQTestRuleWidget);
