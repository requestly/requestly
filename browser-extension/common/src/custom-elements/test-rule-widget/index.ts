import styles from "./index.css";
import { registerCustomElement, setInnerHTML } from "../utils";
import TickIcon from "../../../resources/icons/tick.svg";
import CrossIcon from "../../../resources/icons/close.svg";

enum RQTestRuleWidgetEvent {
  VIEW_RESULTS = "view-results",
}

const TAG_NAME = "rq-test-rule-widget";
const DEFAULT_POSITION = { right: 10, top: 10 };

class RQTestRuleWidget extends HTMLElement {
  #shadowRoot;
  #isDragging = false;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.#shadowRoot, this._getDefaultMarkup());
  }

  connectedCallback() {
    this.setAttribute("draggable", "true");
    this.addListeners();

    const ruleName = this.#shadowRoot.getElementById("rule-name");
    ruleName.textContent = "Testing " + this.attributes.getNamedItem("rule-name")?.value ?? null;

    const iconPath = this.attributes.getNamedItem("icon-path")?.value;
    if (iconPath) {
      const iconContainer = this.#shadowRoot.getElementById("icon-container");
      const icon = document.createElement("img");
      icon.setAttribute("src", iconPath);
      iconContainer?.appendChild(icon);
    }

    const appliedStatus = this.attributes.getNamedItem("applied-status")?.value;
    const ruleStatusContainer = this.#shadowRoot.getElementById("rule-status");
    if (appliedStatus === "false") {
      ruleStatusContainer.innerHTML = `
				<div id="rule-status-icon" class="cross-icon">
					${CrossIcon}
				</div>
				Rule not applied
			`;
    } else if (appliedStatus === "true") {
      ruleStatusContainer.innerHTML = `
				<div id="rule-status-icon" class="tick-icon">
					${TickIcon}
				</div>
				Rule applied
			`;
    }
  }

  addListeners() {
    this.#shadowRoot.getElementById("view-result-btn").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQTestRuleWidgetEvent.VIEW_RESULTS);
    });

    this.addEventListener("mousedown", (evt: MouseEvent) => {
      evt.preventDefault();

      let x = evt.clientX;
      let y = evt.clientY;

      const onMouseMove = (evt: MouseEvent) => {
        evt.preventDefault();

        this.#isDragging = true;

        const dX = evt.clientX - x;
        const dY = evt.clientY - y;

        x = evt.clientX;
        y = evt.clientY;

        const xPos = Math.min(Math.max(this.offsetLeft + dX, 0), window.innerWidth - this.offsetWidth);
        const yPos = Math.min(Math.max(this.offsetTop + dY, 0), window.innerHeight - this.offsetHeight);
        this.moveToPostion({ top: yPos, left: xPos });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    this.#shadowRoot.addEventListener(
      "click",
      (evt) => {
        if (this.#isDragging) {
          // disable all clicks while widget is dragging
          evt.stopPropagation();
          this.#isDragging = false;
        }
      },
      true
    );

    window.addEventListener("resize", () => {
      const boundingRect = this.getBoundingClientRect();

      if (
        boundingRect.left + boundingRect.width > window.innerWidth ||
        boundingRect.top + boundingRect.height > window.innerHeight
      ) {
        this.moveToPostion(DEFAULT_POSITION);
      }
    });
  }

  moveToPostion(position: { top?: number; bottom?: number; left?: number; right?: number }) {
    const getCSSPostionValue = (num?: number) => (typeof num !== "undefined" ? `${num}px` : "auto");

    this.style.left = getCSSPostionValue(position.left);
    this.style.top = getCSSPostionValue(position.top);
    this.style.bottom = getCSSPostionValue(position.bottom);
    this.style.right = getCSSPostionValue(position.right);
  }

  triggerEvent(name: RQTestRuleWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
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
