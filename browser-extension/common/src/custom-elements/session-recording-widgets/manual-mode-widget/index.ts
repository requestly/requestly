import styles from "./index.css";
import { getEpochToMMSSFormat, registerCustomElement, setInnerHTML } from "../../utils";
import BinIcon from "../../../../resources/icons/bin.svg";
import StopRecordingIcon from "../../../../resources/icons/stopRecording.svg";
import InfoIcon from "../../../../resources/icons/info.svg";
import { RQDraggableWidget } from "../../abstract-classes/draggable-widget";

enum RQSessionRecordingWidgetEvent {
  STOP_RECORDING = "stop",
  DISCARD_RECORDING = "discard",
}

const TAG_NAME = "rq-session-recording-widget";
const DEFAULT_POSITION = { left: 30, bottom: 30 };
const EXPLICIT_RECORDING_LIMIT = 5 * 60 * 1000; // 5 mins * 60 secs * 1000 ms

class RQSessionRecordingWidget extends RQDraggableWidget {
  #currentRecordingTime = 0;
  #recordingTimerIntervalId: NodeJS.Timeout | null;

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
      this.show(evt.detail?.position, evt.detail?.currentRecordingTime);
    });

    this.addEventListener("hide", this.hide);
  }

  triggerEvent(name: RQSessionRecordingWidgetEvent, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  _getDefaultMarkup() {
    const tooltipContent =
      "Session recording is limited to the most recent 5 minutes. The recording is still active, but you can only view the last 5 minutes of the session.";

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

  show(position = DEFAULT_POSITION, currentRecordingTime: number | null = null) {
    this.moveToPostion(position);
    this.setAttribute("draggable", "true");
    const container = this.getContainer();
    container.classList.add("visible");

    if (currentRecordingTime === null) return;

    this.#currentRecordingTime = currentRecordingTime;

    if (this.#recordingTimerIntervalId) {
      clearInterval(this.#recordingTimerIntervalId);
    }

    if (this.#currentRecordingTime < EXPLICIT_RECORDING_LIMIT) {
      setInnerHTML(container.querySelector(".recording-time"), getEpochToMMSSFormat(this.#currentRecordingTime));
    }

    this.#recordingTimerIntervalId = setInterval(
      () => {
        this.#currentRecordingTime = this.#currentRecordingTime + 1000;

        if (this.#currentRecordingTime < EXPLICIT_RECORDING_LIMIT) {
          setInnerHTML(container.querySelector(".recording-time"), getEpochToMMSSFormat(this.#currentRecordingTime));
        } else {
          setInnerHTML(container.querySelector(".recording-time"), "05:00");
          container.querySelector(".recording-info-icon").classList.add("visible");
          clearInterval(this.#recordingTimerIntervalId);
        }
      },
      this.#currentRecordingTime < EXPLICIT_RECORDING_LIMIT ? 1000 : 0
    );
  }

  resetTimer() {
    if (this.#recordingTimerIntervalId) {
      clearInterval(this.#recordingTimerIntervalId);
    }

    this.#currentRecordingTime = 0;
    this.#recordingTimerIntervalId = null;
    setInnerHTML(this.getContainer().querySelector(".recording-time"), "00:00");
    this.getContainer().querySelector(".recording-info-icon").classList.remove("visible");
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
