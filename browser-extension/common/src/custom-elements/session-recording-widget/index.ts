import styles from "./index.css";
import { registerCustomElement } from "../registerCustomElement";
import BinIcon from "../../../resources/icons/bin.svg";

enum RQSessionRecordingWidgetEvent {
  STOP_RECORDING = "stop",
  DISCARD_RECORDING = "discard",
}

class RQSessionRecordingWidget extends HTMLElement {
  #shadowRoot;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.innerHTML = this._getDefaultMarkup();

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  connectedCallback() {
    this.#shadowRoot.querySelector(".stop-recording").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQSessionRecordingWidgetEvent.STOP_RECORDING);
      this.hide();
    });

    this.#shadowRoot.querySelector(".discard-recording").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQSessionRecordingWidgetEvent.DISCARD_RECORDING);
      this.hide();
    });

    this.show();
  }

  triggerEvent(name: RQSessionRecordingWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  _getDefaultMarkup() {
    return `
      <style>${styles}</style>
      <div id="container">
        <div>
          <span class="recording-icon"></span>
          <span class="action stop-recording">Stop & Watch recording</span>
        </div>
        <div>  
          <span class="divider"></span>
          <span class="action discard-recording" title="Discard">${BinIcon}</span>
        </div>  
      </div>
    `;
  }

  show() {
    this.#shadowRoot.getElementById("container")?.classList.add("visible");
  }

  hide() {
    this.#shadowRoot.getElementById("container")?.classList.remove("visible");
  }
}

registerCustomElement("rq-session-recording-widget", RQSessionRecordingWidget);
