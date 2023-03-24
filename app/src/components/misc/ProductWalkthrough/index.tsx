import React, { useEffect, useRef } from "react";
import JoyRide, { EVENTS, STATUS, CallBackProps } from "react-joyride";
import { productTours } from "./tours";
import { WalkthroughTooltip } from "./Tooltip";
import {
  trackWalkthroughCompleted,
  trackWalkthroughStepCompleted,
  trackWalkthroughViewed,
} from "modules/analytics/events/misc/productWalkthrough";

interface TourProps {
  startWalkthrough: boolean;
  tourFor: string;
  runTourWithABTest: boolean; //temporary flag
}

export const ProductWalkthrough: React.FC<TourProps> = ({
  startWalkthrough = false,
  tourFor,
  runTourWithABTest = true,
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
      trackWalkthroughStepCompleted(index + 1, tourFor);
      WalkthroughHelpers?.next();
    }
  };

  useEffect(() => {
    if (startWalkthrough && runTourWithABTest) {
      trackWalkthroughViewed();
    }
  }, [runTourWithABTest, startWalkthrough]);

  return (
    <>
      {startWalkthrough && (
        <JoyRide
          ref={joyrideRef}
          run={startWalkthrough && runTourWithABTest}
          steps={productTours[tourFor]}
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
      )}
    </>
  );
};
