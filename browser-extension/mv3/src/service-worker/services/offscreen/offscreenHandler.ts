import { getRefreshToken } from "../../../utils";

class OffscreenHandler {
  private isOffscreenDocCreated: boolean = false;
  private creating: Promise<void> = null;

  private async setupOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL("/offscreen.html");
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [offscreenUrl],
    });

    if (existingContexts.length > 0) {
      return;
    }

    if (this.creating) {
      await this.creating;
    } else {
      this.creating = chrome.offscreen.createDocument({
        url: "/offscreen.html",
        reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
        justification: "Open Requestly in iframe",
      });
      await this.creating;
      this.creating = null;
      this.isOffscreenDocCreated = true;
    }
  }

  public sendMessage(message: Record<string, any>) {
    chrome.runtime.sendMessage({
      ...message,
      target: "offscreen",
    });
  }

  public async initWebAppOffscreen() {
    if (this.isOffscreenDocCreated) {
      return;
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return;
    }

    await this.setupOffscreenDocument();
    this.sendMessage({
      action: "load_webapp",
      urlParams: {
        refreshToken,
      },
    });
  }

  public isOffscreenWebappOpen() {
    return this.isOffscreenDocCreated;
  }
}

export default new OffscreenHandler();
