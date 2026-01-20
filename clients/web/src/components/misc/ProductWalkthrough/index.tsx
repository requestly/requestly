import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import JoyRide, { EVENTS, STATUS, CallBackProps, TooltipRenderProps } from "react-joyride";
import { productTours } from "./tours";
import { WalkthroughTooltip } from "./Tooltip";
import {
  trackWalkthroughCompleted,
  trackWalkthroughStepCompleted,
  trackWalkthroughViewed,
} from "modules/analytics/events/misc/productWalkthrough";

interface TourProps {
  completeTourOnUnmount?: boolean;
  startWalkthrough?: boolean;
  tourFor: string;
  context?: any;
  onTourComplete: () => void;
}

export const ProductWalkthrough: React.FC<TourProps> = ({
  completeTourOnUnmount = true,
  startWalkthrough = false,
  tourFor,
  context,
  onTourComplete,
}) => {
  const joyrideRef = useRef(null);
  const [hasReachedLastStep, setHasReachedLastStep] = useState<boolean>(false);
  const WalkthroughHelpers = joyrideRef.current?.WalkthroughHelpers;
  const tourSteps = useMemo(() => productTours[tourFor], [tourFor]);

  const renderCustomToolTip = useCallback(
    (props: TooltipRenderProps) => {
      return <WalkthroughTooltip {...props} context={context} />;
    },
    [context]
  );

  const callback = (data: CallBackProps) => {
    const { index, type, status } = data;
    if (status === STATUS.SKIPPED) {
      WalkthroughHelpers?.skip();
      onTourComplete();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      trackWalkthroughStepCompleted(index + 1, tourFor);
      WalkthroughHelpers?.next();
    }
    if (type === EVENTS.TOUR_END) {
      onTourComplete();
      trackWalkthroughCompleted(tourFor);
    }
    if (index >= tourSteps?.length - 1) {
      setHasReachedLastStep(true);
    }
  };

  useEffect(() => {
    if (startWalkthrough) {
      trackWalkthroughViewed(tourFor);
    }
  }, [startWalkthrough, tourFor]);

  useEffect(() => {
    // complete the tour is  TOUR_END does not trigger after last step
    // eg. clicking on create rule button in rule editor tour
    return () => {
      if (hasReachedLastStep && completeTourOnUnmount) {
        trackWalkthroughCompleted(tourFor);
        onTourComplete();
      }
    };
  }, [hasReachedLastStep, onTourComplete, tourFor, completeTourOnUnmount]);

  return (
    <>
      {startWalkthrough && (
        <JoyRide
          ref={joyrideRef}
          run={startWalkthrough}
          steps={tourSteps}
          continuous={true}
          callback={callback}
          tooltipComponent={renderCustomToolTip}
          disableScrolling={true}
          disableOverlayClose={true}
          disableCloseOnEsc={true}
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
