import React from "react";
import JoyRide from "react-joyride";
import { ProductTours } from "./tours";
import { TourTooltip } from "./Tooltip";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const Tour: React.FC = () => {
  return (
    <JoyRide
      steps={ProductTours[GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]}
      continuous={false}
      tooltipComponent={TourTooltip}
      disableScrolling={true}
      disableOverlayClose={true}
      spotlightClicks={true}
      spotlightPadding={5}
      floaterProps={{
        styles: {
          arrow: {
            background: "orange",
            display: "inline-flex",
            length: 5,
            position: "absolute",
            spread: 10,
            border: "1px solid #ff6905",
          },
        },
      }}
      styles={{
        options: {
          overlayColor: "rgba(0, 0, 0, 0.38)",
          arrowColor: "#ff6905",
        },
      }}
    />
  );
};
