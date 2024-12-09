// @ts-nocheck
import { globalActions } from "store/slices/global/slice";
import { IAnalyticsIntegration } from "./common";

class LocalIntegration implements IAnalyticsIntegration {
  isIntegrationDone = false;
  dispatch: any = null;
  dispatchBuffer = {};

  init = (user: any, dispatch: any) => {
    if (dispatch) {
      this.dispatch = dispatch;
      this.isIntegrationDone = true;
    }
  };

  trackEvent = (eventName: string, eventParams: any, retry = 0) => {
    // noop
  };

  trackAttr = (name: string, value: string, retry: number = 0) => {
    if (this.isIntegrationDone && this.dispatch) {
      this.dispatch(globalActions.updateUserAttributes({ ...this.dispatchBuffer, [name]: value }));
      this.dispatchBuffer = {};
    } else {
      this.dispatchBuffer = { ...this.dispatchBuffer, [name]: value };
    }
  };
}

const localIntegration = new LocalIntegration();
export default localIntegration;
