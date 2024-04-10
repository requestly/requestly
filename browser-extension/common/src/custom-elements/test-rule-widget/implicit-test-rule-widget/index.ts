import { RQTestRuleWidget } from "..";
import { registerCustomElement, setInnerHTML } from "../../utils";
import CheckIcon from "../../../../resources/icons/check.svg";

const TAG_NAME = "rq-implicit-test-rule-widget";

class RQImplicitTestRuleWidget extends RQTestRuleWidget {
  #appliedRules: { ruleId: string; ruleName: string }[] = [];

  connectedCallback() {
    super.connectedCallback();

    const contentContainer = this.shadowRoot.getElementById("content-container");
    const minimizedStatusBtn = this.shadowRoot.getElementById("minimized-status-btn");
    const widgetContent = `<div class="applied-rules-list-header">Rules applied on this page</div><div id="applied-rules-list"></div>`;
    setInnerHTML(minimizedStatusBtn, `<span class="rq-success">${CheckIcon}</span>`);
    setInnerHTML(contentContainer, widgetContent);

    const settingsButton = this.shadowRoot.getElementById("settings-button");
    settingsButton.classList.remove("hidden");

    this.addWidgetListeners();
  }

  addWidgetListeners() {
    this.addEventListener("new-rule-applied", (evt: CustomEvent) => {
      console.log("new-rule-applied event received in implicit test rule widget", evt.detail.appliedRuleId);
      this.#appliedRules.push({
        ruleId: evt.detail.appliedRuleId,
        ruleName: evt.detail.appliedRuleName,
      });

      this.renderAppliedRules();
    });

    this.shadowRoot.getElementById("settings-button").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("open_app_settings"));
    });
  }

  triggerAppliedRuleClickedEvent(detail: any) {
    this.dispatchEvent(new CustomEvent("view_rule_in_editor", { detail }));
  }

  renderAppliedRules() {
    const appliedRulesList = this.shadowRoot.getElementById("applied-rules-list");

    const appliedRulesMarkup = this.#appliedRules.map((rule) => {
      return `
        <div class="applied-rule-list-item">
          <span>${rule.ruleName}</span>
        </div>`;
    });

    setInnerHTML(appliedRulesList, appliedRulesMarkup.join(""));

    appliedRulesList.querySelectorAll(".applied-rule-list-item").forEach((ruleElement, index) => {
      ruleElement.addEventListener("click", () => {
        this.triggerAppliedRuleClickedEvent({
          ruleId: this.#appliedRules[index].ruleId,
        });
      });
    });
  }
}

registerCustomElement(TAG_NAME, RQImplicitTestRuleWidget);
