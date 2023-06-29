class RQToast extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this._getDefaultMarkup();
    console.log("!!!debug", "this::", this);
  }

  connectedCallback() {
    this.setAttribute("style", "position:fixed;z-index:2147483647;width:100%;top:0;");
    const heading = this.shadowRoot?.getElementById("heading");
    const subheading = this.shadowRoot?.getElementById("subheading");
    if (heading) heading.textContent = this.attributes.getNamedItem("heading")?.value ?? null;
    if (subheading) subheading.textContent = this.attributes.getNamedItem("subheading")?.value ?? null;

    const iconPath = this.attributes.getNamedItem("icon-path")?.value;
    if (iconPath) {
      const iconContainer = this.shadowRoot?.getElementById("icon");
      const icon = document.createElement("img");
      icon.setAttribute("src", iconPath);
      icon.setAttribute("height", "20px");
      icon.setAttribute("width", "20px");
      iconContainer?.appendChild(icon);
    }

    const container = this.shadowRoot?.getElementById("container");
    if (container) {
      setTimeout(() => container.classList.add("active"), 300);
      setTimeout(() => container.classList.remove("active"), 4000);
    }
  }

  styles = `
  #container{
    background-color:#295FF6;
    border-radius:8px;
    padding: 16px 24px;
    margin:16px;
    width:30vw;
    right:0;
    position:absolute;
    display:flex;
    flex-direction:column;
    color: #FFF;
    font-family: Roboto;
    font-weight: 600;
    line-height: 150%;
    transform: translateX(calc(100% + 20px));
    transition: all 0.5s cubic-bezier(0.3, -0.1, 1, 1);
  }

  #container.active{
    transform: translateX(0);
  }

  #heading{
    font-size:16px;
    margin:4px 0;
  }

  #subheading-container{
    display:flex;
    flex-direction:row;
  }

  #subheading{
    font-size:13px;
    margin:4px 0;
    line-height:1.4;
  }

  #icon{
    height:20px;
    width:20px;
    background:#2a2a2a;
  }
  `;

  _getDefaultMarkup() {
    return `
    <style>${this.styles}</style>
    <div id="container">
        <div id="heading"></div>
        <div id="subheading-container">
        <div id="icon"></div>
        <div id="subheading"></div>
        </div>
     </div>
    `;
  }
}

export const defineRQToast = () => {
  // check for font to be as close to requestly.
  customElements.get("rq-toast") ?? customElements.define("rq-toast", RQToast);
};
