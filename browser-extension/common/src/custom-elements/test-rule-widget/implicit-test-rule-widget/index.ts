import { RQTestRuleWidget } from "..";
import { registerCustomElement, setInnerHTML, getRuleTypeIcon } from "../../utils";
import CheckIcon from "../../../../resources/icons/check.svg";
import arrowRightIcon from "../../../../resources/icons/arrowRight.svg";
import { RuleType } from "../../../types";

const TAG_NAME = "rq-implicit-test-rule-widget";

class RQImplicitTestRuleWidget extends RQTestRuleWidget {
  #appliedRules: { ruleId: string; ruleName: string; ruleType: RuleType }[] = [];

  connectedCallback() {
    super.connectedCallback();

    this.toggleMinimize(true);
    const contentContainer = this.shadowRoot.getElementById("test-rule-container");
    const minimizedStatusBtn = this.shadowRoot.getElementById("test-rule-minimized-btn");
    const widgetContent = `
    <div id="implicit-widget-container">
      <div id="applied-rules-list-header">Rules applied on this page</div>
      <div id="applied-rules-list"></div>
    </div>`;
    setInnerHTML(minimizedStatusBtn, `<span class="success">${CheckIcon}</span>`);
    setInnerHTML(contentContainer, widgetContent);

    const settingsButton = this.shadowRoot.getElementById("settings-button");
    settingsButton.classList.remove("hidden");
    this.addWidgetListeners();

    const appliedRuleId = this.attributes.getNamedItem("applied-rule-id")?.value;
    const appliedRuleName = this.attributes.getNamedItem("applied-rule-name")?.value;
    const appliedRuleType = this.attributes.getNamedItem("applied-rule-type")?.value;
    if (appliedRuleId && appliedRuleName && appliedRuleType) {
      this.#appliedRules.push({
        ruleId: appliedRuleId,
        ruleName: appliedRuleName,
        ruleType: appliedRuleType as RuleType,
      });
      this.renderAppliedRules();
    }
  }

  addWidgetListeners() {
    this.addEventListener("new-rule-applied", (evt: CustomEvent) => {
      const isRuleAlreadyApplied = this.#appliedRules.some((rule) => rule.ruleId === evt.detail.appliedRuleId);
      if (isRuleAlreadyApplied) return;

      this.#appliedRules.push({
        ruleId: evt.detail.appliedRuleId,
        ruleName: evt.detail.appliedRuleName,
        ruleType: evt.detail.appliedRuleType,
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
          <div class="applied-rule-item-details">
            <span class="applied-rule-icon">${getRuleTypeIcon(rule.ruleType)}</span> 
            <span class="applied-rule-name">${rule.ruleName}</span>
          </div>
         <span class="applied-rule-arrow-icon">${arrowRightIcon}</span>
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
