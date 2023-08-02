import styles from "./index.css";
import { registerCustomElement } from "../registerCustomElement";
import BinIcon from "../../../resources/icons/bin.svg";

enum RQSessionRecordingWidgetEvent {
  STOP_RECORDING = "stop",
  DISCARD_RECORDING = "discard",
  MOVED = "moved",
}

const TAG_NAME = "rq-session-recording-widget";
const DEFAULT_POSITION = { left: 30, bottom: 30 };

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

    this.addEventListener("dragstart", (evt) => {
      evt.dataTransfer.setData("id", TAG_NAME);

      const boundingRect = this.getBoundingClientRect();
      const offset = {
        x: evt.clientX - boundingRect.left,
        y: evt.clientY - boundingRect.top,
        width: boundingRect.width,
        height: boundingRect.height,
      };

      evt.dataTransfer.setData("offset", JSON.stringify(offset));
    });

    document.documentElement.addEventListener("dragover", (evt) => {
      evt.preventDefault();
      evt.dataTransfer.dropEffect = "move";
    });

    document.documentElement.addEventListener("drop", (evt) => {
      evt.preventDefault();

      if (evt.dataTransfer.getData("id") === TAG_NAME) {
        const offset = JSON.parse(evt.dataTransfer.getData("offset"));
        const xPos = Math.min(Math.max(evt.clientX - offset.x, 0), window.innerWidth - offset.width);
        const yPos = Math.min(Math.max(evt.clientY - offset.y, 0), window.innerHeight - offset.height);
        this.moveToPostion({ top: yPos, left: xPos });
      }
    });

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
    const getCSSPostionValue = (num?: number) => (num ? `${num}px` : "auto");

    this.style.left = getCSSPostionValue(position.left);
    this.style.top = getCSSPostionValue(position.top);
    this.style.bottom = getCSSPostionValue(position.bottom);
    this.style.right = getCSSPostionValue(position.right);

    this.triggerEvent(RQSessionRecordingWidgetEvent.MOVED, position);
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

  show(position = DEFAULT_POSITION) {
    this.moveToPostion(position);
    this.setAttribute("draggable", "true");
    this.#shadowRoot.getElementById("container").classList.add("visible");
  }

  hide() {
    this.#shadowRoot.getElementById("container").classList.remove("visible");
  }
}

registerCustomElement(TAG_NAME, RQSessionRecordingWidget);
