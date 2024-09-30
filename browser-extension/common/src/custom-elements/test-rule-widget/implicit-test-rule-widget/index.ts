import { RQTestRuleWidget } from "..";
import { registerCustomElement, setInnerHTML, getRuleTypeIcon } from "../../utils";
import CheckIcon from "../../../../resources/icons/check.svg";
import arrowRightIcon from "../../../../resources/icons/arrowRight.svg";
import { RuleType } from "../../../types";

const TAG_NAME = "rq-implicit-test-rule-widget";
const IMPLICIT_WIDGET_DISPLAY_TIME = 5 * 1000; // secs

type AppliedRule = { ruleId: string; ruleName: string; ruleType: RuleType };

class RQImplicitTestRuleWidget extends RQTestRuleWidget {
  #appliedRules: AppliedRule[] = [];
  #widgetDisplayTimerId: NodeJS.Timeout | null;
  #progressBar: HTMLElement;

  connectedCallback() {
    super.connectedCallback();

    const contentContainer = this.shadowRoot.getElementById("test-rule-container");
    const minimizedStatusBtn = this.shadowRoot.getElementById("test-rule-minimized-btn");
    const widgetContent = `
    <div id="implicit-widget-container">
    <div id="applied-rules-list-header">Rules applied on this page</div>
    <div id="applied-rules-list"></div>
    <div class="test-rule-widget-progress-bar"/>
    </div>`;
    setInnerHTML(minimizedStatusBtn, `<span class="success">${CheckIcon}</span>`);
    setInnerHTML(contentContainer, widgetContent);

    const settingsButton = this.shadowRoot.getElementById("settings-button");
    settingsButton.classList.remove("hidden");

    const minimizeButton = this.shadowRoot.getElementById("minimize-button");
    minimizeButton.classList.add("hidden");

    const closeButton = this.shadowRoot.getElementById("close-button");
    closeButton.classList.remove("hidden");

    this.#progressBar = this.shadowRoot.querySelector(".test-rule-widget-progress-bar");

    this.addWidgetListeners();

    const appliedRules = JSON.parse(this.attributes.getNamedItem("applied-rules")?.value || "[]");
    if (appliedRules.length) {
      appliedRules.forEach((rule: any) => this.#appliedRules.push(rule));
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

    this.shadowRoot.getElementById("close-button").addEventListener("click", () => {
      this.hide();
    });

    this.dispatchEvent(new CustomEvent("rule_applied_listener_active"));
  }

  show() {
    clearTimeout(this.#widgetDisplayTimerId);
    super.show();
    this.startProgressBarAnimation();
    this.#widgetDisplayTimerId = setTimeout(() => {
      super.hide();
    }, IMPLICIT_WIDGET_DISPLAY_TIME);
  }

  hide() {
    clearTimeout(this.#widgetDisplayTimerId);
    super.hide();
    this.resetProgressBar();
  }

  private startProgressBarAnimation() {
    this.#progressBar.style.width = "100%";
    setTimeout(() => {
      this.#progressBar.style.width = "0%";
    }, 50); // Small delay to ensure the transition is visible
  }

  private resetProgressBar() {
    this.#progressBar.style.transition = "none";
    this.#progressBar.style.width = "100%";
    setTimeout(() => {
      this.#progressBar.style.transition = "width 5s linear";
    }, 50);
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

    this.show();
  }
}

registerCustomElement(TAG_NAME, RQImplicitTestRuleWidget);
