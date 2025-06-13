import { registerCustomElement, setInnerHTML } from "../../utils";
import CheckIcon from "../../../../resources/icons/check.svg";
import PendingIcon from "../../../../resources/icons/pending.svg";
import { RQTestRuleWidget } from "..";

enum RQTestRuleWidgetEvent {
  VIEW_RESULTS = "view-results",
}

const TAG_NAME = "rq-explicit-test-rule-widget";
class RQExplicitTestRuleWidget extends RQTestRuleWidget {
  #testRuleId: string;

  connectedCallback() {
    super.connectedCallback();

    const contentContainer = this.shadowRoot.getElementById("test-rule-container");

    const explicitModeMarkup = `
     <div id="explicit-widget-container">
        <div id="rule-status-container">
          <div id="rule-status"></div>
        </div>
        <div id="test-rule-details">
          <div id="rule-name" class="primary-text"></div>
          <button id="view-result-btn">View Results</button>
        </div>
      </div>
        `;

    setInnerHTML(contentContainer, explicitModeMarkup);
    this.addWidgetListeners();

    this.#testRuleId = this.attributes.getNamedItem("rule-id")?.value;

    const ruleName = this.shadowRoot.getElementById("rule-name");
    ruleName.textContent = "Testing " + (this.attributes.getNamedItem("rule-name")?.value || "rule");

    const appliedStatus = this.attributes.getNamedItem("applied-status")?.value;
    this.showRuleAppliedStatus(appliedStatus === "true");
  }

  addWidgetListeners() {
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
  }

  triggerEvent(name: RQTestRuleWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  showRuleAppliedStatus(appliedStatus: boolean) {
    const ruleStatusContainer = this.shadowRoot.getElementById("rule-status");
    const minimizedStatusBtn = this.shadowRoot.getElementById("test-rule-minimized-btn");
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
        <span class="success">${CheckIcon}</span>
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
        <span class="warning">${PendingIcon}</span>
      `
      );
    }
  }
}

registerCustomElement(TAG_NAME, RQExplicitTestRuleWidget);
