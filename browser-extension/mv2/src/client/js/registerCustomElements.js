RQ.RegisterCustomElements = {
  init() {
    RQ.ClientUtils.addRemoteJS(chrome.runtime.getURL("libs/customElements.js"));
  },
};
