import { RQTestRuleWidget } from "..";
import { registerCustomElement, setInnerHTML } from "../../utils";

const TAG_NAME = "rq-implicit-test-rule-widget";

class RQImplicitTestRuleWidget extends RQTestRuleWidget {
  connectedCallback() {
    super.connectedCallback();

    const contentContainer = this.shadowRoot.getElementById("content-container");
    const widgetContent = `        
        <div>IMPLICIT WIDGET HERE</div>`;

    setInnerHTML(contentContainer, widgetContent);
  }
}

registerCustomElement(TAG_NAME, RQImplicitTestRuleWidget);
