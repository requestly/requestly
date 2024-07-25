import { registerCustomElement } from "../../utils";
import { setInnerHTML } from "../../utils";
// import closeIcon from "../../../../resources/icons/close.svg";
import styles from "./index.css";

const TAG_NAME = "rq-post-session-save-widget";

class RQPostSessionSaveWidget extends HTMLElement {
  shadowRoot: HTMLElement["shadowRoot"];

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "closed" });
  }

  connectedCallback() {
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());
    const savedView = this.shadowRoot.querySelector(".session-saved-view");
    savedView.classList.add("hidden");
    this.addWidgetListeners();
  }

  _getDefaultMarkup() {
    return `
      <style>${styles}</style>
        <div class="post-session-save-widget-container">
            <div class="session-saving-view">
            <div class="session-saving-title-container">
            <div class="session-saving-loader"><div></div><div></div><div></div><div></div></div>
            <div class="session-saving-title">Saving session</div>
            </div>
            <div class="session-saving-description">Please wait as we save the session. This process may take a few seconds.</div>
            </div>
            <div class="session-saved-view">Session Saved!</div>
        </div>
      </div>
    `;
  }

  addWidgetListeners() {
    this.addEventListener("show-draft-session-saved-widget", () => {
      console.log("show-draft-session-saved-widget event received");
      const sessionSavingView = this.shadowRoot.querySelector(".session-saving-view");
      const sessionSavedView = this.shadowRoot.querySelector(".session-saved-view");
      sessionSavingView.classList.add("hidden");
      sessionSavedView.classList.remove("hidden");
    });
  }
}

registerCustomElement(TAG_NAME, RQPostSessionSaveWidget);
