import styles from "./index.css";
import { registerCustomElement, setInnerHTML } from "../utils";
import BinIcon from "../../../resources/icons/bin.svg";
import { RQDraggableWidget } from "../abstract-classes/draggable-widget";

enum RQSessionRecordingWidgetEvent {
  STOP_RECORDING = "stop",
  DISCARD_RECORDING = "discard",
  MOVED = "moved",
}

const TAG_NAME = "rq-session-recording-widget";
const DEFAULT_POSITION = { left: 30, bottom: 30 };

class RQSessionRecordingWidget extends RQDraggableWidget {
  #shadowRoot;

  constructor() {
    super(DEFAULT_POSITION);
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.#shadowRoot, this._getDefaultMarkup());

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addListeners();
    this.show();
  }

  addListeners() {
    this.#shadowRoot.querySelector(".stop-recording").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQSessionRecordingWidgetEvent.STOP_RECORDING);
    });

    this.#shadowRoot.querySelector(".discard-recording").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQSessionRecordingWidgetEvent.DISCARD_RECORDING);
      this.hide();
    });

    this.addEventListener("show", (evt: CustomEvent) => {
      this.show(evt.detail?.position);
    });

    this.addEventListener("hide", this.hide);

    this.#shadowRoot.addEventListener(
      "click",
      (evt) => {
        if (super.isDragging) {
          // disable all clicks while widget is dragging
          evt.stopPropagation();
          super.isDragging = false;
        }
      },
      true
    );
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
          <span class="action stop-recording">Stop & Watch Replay</span>
        </div>
        <div>
          <span class="divider"></span>
          <span class="action discard-recording" title="Discard">${BinIcon}</span>
        </div>
      </div>
    `;
  }

  show(position = DEFAULT_POSITION) {
    this.moveToPostion(position);
    this.setAttribute("draggable", "true");
    this.getContainer().classList.add("visible");
  }

  hide() {
    this.getContainer().classList.remove("visible");
  }

  getContainer() {
    return this.#shadowRoot.getElementById("container");
  }
}

registerCustomElement(TAG_NAME, RQSessionRecordingWidget);
