import { registerCustomElement } from "../../utils";
import { setInnerHTML } from "../../utils";
import closeIcon from "../../../../resources/icons/close.svg";
import checkIcon from "../../../../resources/icons/check.svg";
import styles from "./index.css";
import config from "../../../config";

const TAG_NAME = "rq-post-session-save-widget";

class RQPostSessionSaveWidget extends HTMLElement {
  shadowRoot: HTMLElement["shadowRoot"];
  #sessionId: string;

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
  // TODO: ADD ICONS IN BUTTONS
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
            <div class="session-saved-view">
            <div class="session-saved-close-icon">${closeIcon}</div>
            <div class="session-saved-title-container">
            <div class="session-saved-title-icon">${checkIcon}</div>
            <div class="session-saved-title">Session saved!</div>
            </div>
            <div class="session-saved-description-container">
              <div class="session-saved-description">The session has been saved in your SessionBear account.</div>
            </div>
            <div class="session-saved-actions">
            <div class="session-copy-link-btn">Copy link</div>
            <div class="view-session-btn">View session</div>
            </div>
            </div>
        </div>
      </div>
    `;
  }

  addWidgetListeners() {
    this.addEventListener("show-draft-session-saved-widget", (event: CustomEvent) => {
      this.#sessionId = event.detail.sessionId;
      const sessionSavingView = this.shadowRoot.querySelector(".session-saving-view");
      const sessionSavedView = this.shadowRoot.querySelector(".session-saved-view");
      sessionSavingView.classList.add("hidden");
      sessionSavedView.classList.remove("hidden");
    });

    const copyLinkButton = this.shadowRoot.querySelector(".session-copy-link-btn");
    copyLinkButton.addEventListener("click", () => {
      copyLinkButton.innerHTML = "Link copied!";
      navigator.clipboard.writeText(`${config.WEB_URL}/sessions/saved/${this.#sessionId}`);
      setTimeout(() => {
        copyLinkButton.innerHTML = "Copy link";
      }, 1000);
    });

    const viewSessionButton = this.shadowRoot.querySelector(".view-session-btn");
    viewSessionButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("view-saved-session-clicked", { detail: { sessionId: this.#sessionId } }));
    });

    const closeButton = this.shadowRoot.querySelector(".session-saved-close-icon");
    closeButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("close-post-session-save-widget-clicked"));
    });
  }
}

registerCustomElement(TAG_NAME, RQPostSessionSaveWidget);
