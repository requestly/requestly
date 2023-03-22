import React, { useEffect, useRef } from "react";
import JoyRide, { EVENTS, STATUS, CallBackProps } from "react-joyride";
import { ProductTours } from "./tours";
import { WalkthroughTooltip } from "./Tooltip";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../../../config/constants";
import {
  trackWalkthroughCompleted,
  trackWalkthroughStepCompleted,
  trackWalkthroughViewed,
} from "modules/analytics/events/misc/productWalkthrough";

interface TourProps {
  startWalkthrough: boolean;
  editorMode: string;
  runTourWithABTest: boolean;
}

export const ProductWalkthrough: React.FC<TourProps> = ({
  startWalkthrough,
  editorMode,
  runTourWithABTest = false,
}) => {
  const joyrideRef = useRef(null);
  const WalkthroughHelpers = joyrideRef.current?.WalkthroughHelpers;

  const callback = (data: CallBackProps) => {
    const { index, type, status } = data;
    if (status === STATUS.SKIPPED) {
      WalkthroughHelpers?.skip();
    } else if (status === STATUS.FINISHED) {
      trackWalkthroughCompleted();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      trackWalkthroughStepCompleted(
        index + 1,
        GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
      );
      WalkthroughHelpers?.next();
    }
  };

  useEffect(() => {
    if (
      startWalkthrough &&
      editorMode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
      runTourWithABTest
    ) {
      WalkthroughHelpers?.go(0); // start product walkthrough from first step
      trackWalkthroughViewed();
    }
  }, [startWalkthrough, editorMode, WalkthroughHelpers, runTourWithABTest]);

  return (
    <JoyRide
      ref={joyrideRef}
      run={
        startWalkthrough &&
        editorMode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
        runTourWithABTest
      }
      steps={ProductTours[GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]}
      continuous={true}
      callback={callback}
      tooltipComponent={WalkthroughTooltip}
      disableScrolling={true}
      disableOverlayClose={true}
      spotlightClicks={true}
      spotlightPadding={5}
      floaterProps={{
        hideArrow: true,
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
