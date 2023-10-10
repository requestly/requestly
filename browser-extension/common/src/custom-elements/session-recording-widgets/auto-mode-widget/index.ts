import { RQDraggableWidget } from "../../abstract-classes/draggable-widget";
import { registerCustomElement, setInnerHTML } from "../../utils";
import ReplayLastFiveMinuteIcon from "../../../../resources/icons/replayLastFiveMinute.svg";
import RQLogo from "../../../../resources/icons/rqLogo.svg";
import styles from "./index.css";

enum RQSessionAutoModeRecordingWidgetEvent {
  WATCH = "watch",
}

const TAG_NAME = "rq-session-recording-auto-mode-widget";
const DEFAULT_POSITION = { left: 30, bottom: 30 };

class RQSessionRecordingAutoModeWidget extends RQDraggableWidget {
  constructor() {
    super(DEFAULT_POSITION);
    this.shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());
    this.show = this.show.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addListeners();
    this.show();
  }

  addListeners() {
    this.shadowRoot.querySelector(".watch-replay").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQSessionAutoModeRecordingWidgetEvent.WATCH);
    });

    this.addEventListener("show", (evt: CustomEvent) => {
      this.show(evt.detail?.position);
    });
  }

  triggerEvent(name: RQSessionAutoModeRecordingWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  _getDefaultMarkup() {
    return `
    <style>${styles}</style>
    <div id="container">
      <span class="rq-logo">${RQLogo}</span>
      <button class="watch-replay">
        <span class="btn-text">${ReplayLastFiveMinuteIcon} Watch last 5 min replay</span>
      </button>
    </div>
    `;
  }

  show(position = DEFAULT_POSITION) {
    this.moveToPostion(position);
    this.setAttribute("draggable", "true");
  }
}

registerCustomElement(TAG_NAME, RQSessionRecordingAutoModeWidget);
