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

    const contentContainer = this.shadowRoot.getElementById("rq-test-rule-container");

    const explicitModeMarkup = `   
     <div id="rq-explicit-widget-container">  
        <div id="rq-rule-status-container">
          <div id="rq-rule-status"></div>
        </div>
        <div id="rq-test-rule-details">
          <div id="rq-rule-name" class="primary-text"></div>
          <button id="rq-view-result-btn">View Results</button>
        </div>
      </div>
        `;

    setInnerHTML(contentContainer, explicitModeMarkup);
    this.addWidgetListeners();

    this.#testRuleId = this.attributes.getNamedItem("rule-id")?.value;

    const ruleName = this.shadowRoot.getElementById("rq-rule-name");
    ruleName.textContent = "Testing " + this.attributes.getNamedItem("rule-name")?.value ?? null;

    const appliedStatus = this.attributes.getNamedItem("applied-status")?.value;
    this.showRuleAppliedStatus(appliedStatus === "true");

    const infoTextContent = this.attributes.getNamedItem("rq-test-rule-text")?.value;
    if (infoTextContent) {
      const infoContainer = this.shadowRoot.getElementById("rq-info-container");
      const infoContainerText = this.shadowRoot.getElementById("rq-info-text");
      setInnerHTML(infoContainerText, infoTextContent);
      infoContainer.classList.remove("hidden");
    }
  }

  addWidgetListeners() {
    this.shadowRoot.getElementById("rq-view-result-btn").addEventListener("click", (evt) => {
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
    const ruleStatusContainer = this.shadowRoot.getElementById("rq-rule-status");
    const minimizedStatusBtn = this.shadowRoot.getElementById("rq-test-rule-minimized-btn");
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
}

registerCustomElement(TAG_NAME, RQExplicitTestRuleWidget);
