import { editor } from "monaco-editor";

export enum toastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

interface IEditorToastAction {
  type: toastType;
  message: string;
  autoClose?: number;
  closable?: boolean;
}

export default class EditorToastOverlay {
  id: string;
  domNode: HTMLDivElement;

  messageTextNode: HTMLSpanElement;
  closeButton: HTMLButtonElement;
  timeoutId: NodeJS.Timeout | null = null;

  constructor(id: string) {
    this.id = id;
    this.initDomNode();
  }

  /* THESE METHODS ARE REQUIRED BY MONACO EDTIOR */
  getId() {
    return this.id;
  }

  getDomNode() {
    return this.domNode;
  }

  getPosition() {
    return {
      preference: editor.OverlayWidgetPositionPreference.TOP_RIGHT_CORNER,
    };
  }

  /* CUSTOM METHODS */
  private initDomNode() {
    this.domNode = document.createElement("div");
    this.domNode.style.display = "none";

    this.messageTextNode = document.createElement("span");
    this.messageTextNode.textContent = "";

    this.domNode.appendChild(this.messageTextNode);

    this.closeButton = document.createElement("button");
    this.closeButton.innerText = "x";
    this.closeButton.style.display = "none";
    this.closeButton.onclick = () => {
      this.hide();
    };
    this.domNode.appendChild(this.closeButton);
  }

  private updateDomNode() {
    // todo: use
    this.domNode.innerHTML = "";
    this.domNode.appendChild(this.messageTextNode);
    this.domNode.appendChild(this.closeButton);
  }

  private getToastClass(type: toastType) {
    switch (type) {
      case toastType.SUCCESS:
        return "editor-toast-success";
      case toastType.ERROR:
        return "editor-toast-error";
      case toastType.INFO:
        return "editor-toast-info";
      case toastType.WARNING:
        return "editor-toast-warning";
    }
  }

  show(config: IEditorToastAction) {
    console.log("show", config);

    this.messageTextNode.innerText = config.message;
    this.domNode.className = this.getToastClass(config.type);
    if (config.closable) {
      this.closeButton.style.display = "block";
    }

    if (config.autoClose) {
      this.timeoutId = setTimeout(() => {
        this.hide();
      }, config.autoClose);
    }

    this.domNode.style.display = "block";

    this.updateDomNode();
  }

  hide() {
    this.domNode.style.display = "none";
    this.domNode.className = "";

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
