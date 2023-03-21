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
      styles={{
        options: {
          arrowColor: "var(--body-background)",
          //   overlayColor: "transparent",
        },
      }}
    />
  );
};
