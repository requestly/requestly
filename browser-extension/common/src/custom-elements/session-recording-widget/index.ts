import styles from "./index.css";
import { getEpochToMMSSFormat, registerCustomElement, setInnerHTML } from "../utils";
import BinIcon from "../../../resources/icons/bin.svg";
import StopRecordingIcon from "../../../resources/icons/stopRecording.svg";
import InfoIcon from "../../../resources/icons/info.svg";
import { RQDraggableWidget } from "../abstract-classes/draggable-widget";

enum RQSessionRecordingWidgetEvent {
  STOP_RECORDING = "stop",
  DISCARD_RECORDING = "discard",
}

const TAG_NAME = "rq-session-recording-widget";
const DEFAULT_POSITION = { left: 30, bottom: 30 };

class RQSessionRecordingWidget extends RQDraggableWidget {
  #currentRecordingTime = 0;
  #recordingTimerIntervalId: NodeJS.Timer | null;

  constructor() {
    super(DEFAULT_POSITION);
    this.shadowRoot = this.attachShadow({ mode: "closed" });
    setInnerHTML(this.shadowRoot, this._getDefaultMarkup());

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addListeners();
    this.show();
  }

  addListeners() {
    this.shadowRoot.querySelector(".stop-recording").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.resetTimer();
      this.triggerEvent(RQSessionRecordingWidgetEvent.STOP_RECORDING);
    });

    this.shadowRoot.querySelector(".discard-recording").addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.triggerEvent(RQSessionRecordingWidgetEvent.DISCARD_RECORDING);
      this.hide();
    });

    this.addEventListener("show", (evt: CustomEvent) => {
      this.show(evt.detail?.position);
    });

    this.addEventListener("hide", this.hide);
  }

  triggerEvent(name: RQSessionRecordingWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  _getDefaultMarkup() {
    const tooltipContent =
      "Session recording is limited to the most recent 5 minutes. The recording is still active, but you can only view the last 5 minutes of the session replay.";

    return `
      <style>${styles}</style>
      <div id="container">
          <span class="recording-icon"></span>
          <span class="recording-time">00:00</span>
          <div title="Recording info" class="recording-info-icon" data-tooltip="${tooltipContent}">
            ${InfoIcon}
          </div>
          <div class="action stop-recording">${StopRecordingIcon} Stop & watch</div>
          <div class="action discard-recording" title="Discard">${BinIcon}</div>
      </div>
    `;
  }

  show(position = DEFAULT_POSITION) {
    this.moveToPostion(position);
    this.setAttribute("draggable", "true");
    const container = this.getContainer();

    container.classList.add("visible");
    const startTime = this.attributes.getNamedItem("recording-start-time")?.value ?? null;

    if (startTime) {
      // additional one sec since timer will run from 0 to 59 secs
      const recordingLimitInMilliseconds = 1 * 60 * 1000 + 1 * 1000; // 5 mins * 60 secs * 1000 ms
      const recordingStartTime = Number(startTime);
      const recordingStopTime = recordingStartTime + recordingLimitInMilliseconds;

      this.#recordingTimerIntervalId = setInterval(() => {
        this.#currentRecordingTime = Date.now() - recordingStartTime;

        if (this.#currentRecordingTime <= recordingLimitInMilliseconds) {
          container.querySelector(".recording-time").innerHTML = getEpochToMMSSFormat(this.#currentRecordingTime);
        } else {
          container.querySelector(".recording-info-icon").classList.add("visible");
        }
      }, 1000);

      setTimeout(() => {
        if (this.#recordingTimerIntervalId) {
          clearInterval(this.#recordingTimerIntervalId);
        }
      }, recordingStopTime - this.#currentRecordingTime);
    }
  }

  resetTimer() {
    if (this.#recordingTimerIntervalId) {
      clearInterval(this.#recordingTimerIntervalId);
    }

    this.#currentRecordingTime = 0;
    this.#recordingTimerIntervalId = null;
    this.getContainer().querySelector(".recording-time").innerHTML = "00:00";
  }

  hide() {
    this.resetTimer();
    this.getContainer().classList.remove("visible");
  }

  getContainer() {
    return this.shadowRoot.getElementById("container");
  }
}

registerCustomElement(TAG_NAME, RQSessionRecordingWidget);
