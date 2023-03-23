import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getAllRules } from "store/selectors";
import JoyRide, { EVENTS, STATUS, CallBackProps } from "react-joyride";
import { ProductTours } from "./tours";
import { WalkthroughTooltip } from "./Tooltip";
import APP_CONSTANTS from "../../../config/constants";
import {
  trackWalkthroughCompleted,
  trackWalkthroughStepCompleted,
  trackWalkthroughViewed,
} from "modules/analytics/events/misc/productWalkthrough";

interface TourProps {
  tourFor: string;
  editorMode: string;
  runTourWithABTest: boolean; //temporary flag
}

export const ProductWalkthrough: React.FC<TourProps> = ({
  tourFor,
  editorMode,
  runTourWithABTest = true,
}) => {
  const [startWalkthrough, setStartWalkthrough] = useState<boolean>(false);
  const joyrideRef = useRef(null);
  const allRules = useSelector(getAllRules);
  const WalkthroughHelpers = joyrideRef.current?.WalkthroughHelpers;

  const callback = (data: CallBackProps) => {
    const { index, type, status } = data;
    if (status === STATUS.SKIPPED) {
      WalkthroughHelpers?.skip();
    } else if (status === STATUS.FINISHED) {
      trackWalkthroughCompleted();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      trackWalkthroughStepCompleted(index + 1, tourFor);
      WalkthroughHelpers?.next();
    }
  };

  useEffect(() => {
    if (
      !allRules.length &&
      editorMode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
      runTourWithABTest
    ) {
      setStartWalkthrough(true);
      trackWalkthroughViewed();
    }
  }, [allRules.length, editorMode, runTourWithABTest]);

  return (
    <JoyRide
      ref={joyrideRef}
      run={startWalkthrough}
      steps={ProductTours[tourFor]}
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
