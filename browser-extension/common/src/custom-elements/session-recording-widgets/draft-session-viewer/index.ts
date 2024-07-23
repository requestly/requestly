import { registerCustomElement } from "../../utils";
import { setInnerHTML } from "../../utils";
import closeIcon from "../../../../resources/icons/close.svg";
import styles from "./index.css";

const TAG_NAME = "rq-draft-session-viewer";

class RQDraftSessionViewer extends HTMLElement {
  shadowRoot: HTMLElement["shadowRoot"];

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());

    const draftSessionWindow = this.shadowRoot.getElementById("draft-session-window");
    draftSessionWindow.classList.add("hidden");

    this.addViewerListeners();
  }

  _getDefaultMarkup() {
    // TODO: handle iframe src
    return `
      <style>${styles}</style>
      <div id="draft-session-window">
      <div id="draft-session-view">
      <div id="draft-view-close-btn">${closeIcon}</div>
      <iframe id="draft-session-iframe" src="http://localhost:3000/iframe/sessions/draft/iframe"></iframe>
      </div>
      </div>
    `;
  }

  addViewerListeners() {
    const draftSessionWindow = this.shadowRoot.getElementById("draft-session-window");
    const draftViewCloseBtn = this.shadowRoot.getElementById("draft-view-close-btn");
    const iframe = this.shadowRoot.getElementById("draft-session-iframe") as HTMLIFrameElement;

    draftViewCloseBtn.addEventListener("click", () => {
      draftSessionWindow.classList.add("hidden");
      iframe.contentWindow.postMessage({ source: "extension", action: "discard-draft-session" }, "*");
      this.sendMessageToIframe(iframe, { source: "extension", action: "discard-draft-session" });
    });

    this.addEventListener("view-draft-session", (event: CustomEvent) => {
      draftSessionWindow.classList.remove("hidden");
      this.sendMessageToIframe(iframe, {
        source: "extension",
        action: "view-draft-session",
        payload: event.detail.session,
      });
    });
  }

  sendMessageToIframe = (iframe: HTMLIFrameElement, message: unknown, targetOrigin: string = "*") => {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, targetOrigin);
    }
  };
}

registerCustomElement(TAG_NAME, RQDraftSessionViewer);
