import styles from "./index.css";
import { registerCustomElement, setInnerHTML } from "../utils";
import { RQDraggableWidget } from "../abstract-classes/draggable-widget";

enum RQTestRuleWidgetEvent {
  VIEW_RESULTS = "view-results",
}

const TAG_NAME = "rq-test-rule-widget";
const DEFAULT_POSITION = { right: 10, top: 10 };

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

    const iconPath = this.attributes.getNamedItem("icon-path")?.value;
    if (iconPath) {
      const iconContainer = this.shadowRoot.getElementById("icon-container");
      const icon = document.createElement("img");
      icon.setAttribute("src", iconPath);
      iconContainer?.appendChild(icon);
    }

    const appliedStatus = this.attributes.getNamedItem("applied-status")?.value;
    this.showRuleAppliedStatus(appliedStatus === "true");
  }

  addListeners() {
    this.shadowRoot.getElementById("view-result-btn").addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.triggerEvent(RQTestRuleWidgetEvent.VIEW_RESULTS);
    });

    this.addEventListener("new-rule-applied", (evt: CustomEvent) => {
      if (evt.detail?.appliedRuleId === this.#testRuleId) {
        this.setAttribute("applied-status", "true");
        this.showRuleAppliedStatus(true);
      }
    });
  }

  triggerEvent(name: RQTestRuleWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  showRuleAppliedStatus(appliedStatus: boolean) {
    const ruleStatusContainer = this.shadowRoot.getElementById("rule-status");
    if (appliedStatus) {
      ruleStatusContainer.innerHTML = `
				✅ Rule applied
			`;
    } else {
      ruleStatusContainer.innerHTML = `
				❌ Rule not applied yet
			`;
    }
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="container">
      <div id="heading-container">
      	<div>
          <div id="icon-container"></div>
          <div id="rule-name"></div>
        </div>
        <button id="view-result-btn">View Results</button>
      </div>
      <div id="content-container">
        <div id="rule-status"></div>
        <div id="secondary-text">You can view detailed logs in console.</div>
      </div>
    </div>
    `;
  }
}

registerCustomElement(TAG_NAME, RQTestRuleWidget);
