export abstract class RQDraggableWidget extends HTMLElement {
  abstract isDragging: boolean;
  #defaultPosition;

  constructor(defaultPosition: { top?: number; bottom?: number; left?: number; right?: number }) {
    super();
    this.#defaultPosition = defaultPosition;
  }

  addDragListeners() {
    // allow widget to be draggable using mouse events
    this.addEventListener("mousedown", (evt: MouseEvent) => {
      evt.preventDefault();

      let x = evt.clientX;
      let y = evt.clientY;

      const onMouseMove = (evt: MouseEvent) => {
        evt.preventDefault();

        this.isDragging = true;

        const dX = evt.clientX - x;
        const dY = evt.clientY - y;

        x = evt.clientX;
        y = evt.clientY;

        const xPos = Math.min(Math.max(this.offsetLeft + dX, 0), window.innerWidth - this.offsetWidth);
        const yPos = Math.min(Math.max(this.offsetTop + dY, 0), window.innerHeight - this.offsetHeight);
        this.moveToPostion({ top: yPos, left: xPos });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
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
  }

  moveToPostion(position: { top?: number; bottom?: number; left?: number; right?: number }) {
    const getCSSPostionValue = (num?: number) => (typeof num !== "undefined" ? `${num}px` : "auto");

    this.style.left = getCSSPostionValue(position.left);
    this.style.top = getCSSPostionValue(position.top);
    this.style.bottom = getCSSPostionValue(position.bottom);
    this.style.right = getCSSPostionValue(position.right);
  }
}
