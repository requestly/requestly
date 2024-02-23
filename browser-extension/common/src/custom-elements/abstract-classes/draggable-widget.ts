enum RQDraggableWidgetEvent {
  MOVED = "moved",
}

export abstract class RQDraggableWidget extends HTMLElement {
  #isDragging: boolean;
  #defaultPosition;
  shadowRoot: HTMLElement["shadowRoot"];

  constructor(defaultPosition: { top?: number; bottom?: number; left?: number; right?: number }) {
    super();
    this.#defaultPosition = defaultPosition;
  }

  connectedCallback() {
    this.addDragListeners();
  }

  addDragListeners() {
    // allow widget to be draggable using mouse events
    this.addEventListener("mousedown", (evt: MouseEvent) => {
      evt.preventDefault();

      let x = evt.clientX;
      let y = evt.clientY;

      const onMouseMove = (evt: MouseEvent) => {
        evt.preventDefault();

        this.#isDragging = true;

        const dX = evt.clientX - x;
        const dY = evt.clientY - y;

        x = evt.clientX;
        y = evt.clientY;

        const xPos = Math.min(Math.max(this.offsetLeft + dX, 0), window.innerWidth - this.offsetWidth);
        const yPos = Math.min(Math.max(this.offsetTop + dY, 0), window.innerHeight - this.offsetHeight);
        this.moveToPostion({ top: yPos, left: xPos });
      };

      const onMouseUp = () => {
        // Fallback incase click event is not triggered. Timeout because we need to stopPropogation in case isDragging=true. Else it will propogate it and cause weird behaviour
        // This happens when mousedown and mouseup doesn't happen on the same element
        // Similar to this https://melkornemesis.medium.com/handling-javascript-mouseup-event-outside-element-b0a34090bb56
        setTimeout(() => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          this.#isDragging = false;
        }, 100);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    this.addEventListener("mouseleave", () => {
      // Fallback to set isDragging false on mouseleave. Timeout used so that event.stopPropagation works when isDragging is true
      setTimeout(() => {
        this.#isDragging = false;
      }, 100);
    });

    window.addEventListener("resize", () => {
      const boundingRect = this.getBoundingClientRect();

      if (
        boundingRect.left + boundingRect.width > window.innerWidth ||
        boundingRect.top + boundingRect.height > window.innerHeight
      ) {
        this.moveToPostion(this.#defaultPosition);
      }
    });

    this.shadowRoot.addEventListener(
      "click",
      (evt) => {
        if (this.#isDragging) {
          // disable all clicks while widget is dragging
          evt.stopPropagation();
          this.#isDragging = false;
        }
      },
      true
    );
  }

  moveToPostion(position: { top?: number; bottom?: number; left?: number; right?: number }) {
    const getCSSPostionValue = (num?: number) => (typeof num !== "undefined" ? `${num}px` : "auto");

    this.style.left = getCSSPostionValue(position.left);
    this.style.top = getCSSPostionValue(position.top);
    this.style.bottom = getCSSPostionValue(position.bottom);
    this.style.right = getCSSPostionValue(position.right);

    this.dispatchEvent(new CustomEvent(RQDraggableWidgetEvent.MOVED, { detail: position }));
  }
}
