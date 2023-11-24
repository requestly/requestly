// @ts-nocheck
import { IAnalyticsIntegration } from "./common";
import { buildBasicUserProperties } from "../utils";

class SaturnIntegration implements IAnalyticsIntegration {
  isIntegrationDone = false;
  enabled = true;
  startTime = Date.now();

  init = (user: any) => {
    console.log("Saturn Integration Start");
    const userData = buildBasicUserProperties(user);
    console.log({ userData });

    if (userData && window?.$saturn) {
      console.log("manual try setUser");

      window.$saturn.setUser(userData.uid, {
        email: userData.email,
        name: userData.name,
      });
    }

    window.addEventListener("saturn:ready", function () {
      if (userData) {
        console.log("saturn:ready");

        window.$saturn.setUser(userData.uid, {
          email: userData.email,
          name: userData.name,
        });
      }
    });
  };
}

const saturnIntegration = new SaturnIntegration();
export default saturnIntegration;
