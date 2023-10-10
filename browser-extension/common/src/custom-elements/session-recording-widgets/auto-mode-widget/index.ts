import { RQDraggableWidget } from "../../abstract-classes/draggable-widget";
import { registerCustomElement, setInnerHTML } from "../../utils";
import styles from "./index.css";

const TAG_NAME = "rq-session-recording-auto-mode-widget";
const DEFAULT_POSITION = { left: 30, bottom: 30 };

class RQSessionRecordingAutoModeWidget extends RQDraggableWidget {
  constructor() {
    super(DEFAULT_POSITION);
    this.shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());
  }

  connectedCallback() {
    super.connectedCallback();
    this.addListeners();
  }

  addListeners() {}

  _getDefaultMarkup() {
    console.log({ styles });
    return `
    <style>${styles}</style>
    <div id="container">
      <span>ICON</span>
      <div><span>ICON</span> Watch last 5 min replay</div>
    </div>
    `;
  }
}

registerCustomElement(TAG_NAME, RQSessionRecordingAutoModeWidget);
