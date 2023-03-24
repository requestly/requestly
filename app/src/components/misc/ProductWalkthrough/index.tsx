import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import JoyRide, {
  EVENTS,
  STATUS,
  CallBackProps,
  TooltipRenderProps,
} from "react-joyride";
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
  context: any;
  runTourWithABTest: boolean; //temporary flag
}

export const ProductWalkthrough: React.FC<TourProps> = ({
  startWalkthrough = false,
  tourFor,
  context,
  runTourWithABTest = true,
}) => {
  const [hasReachedLastStep, setHasReachedLastStep] = useState<boolean>(false);
  const joyrideRef = useRef(null);
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
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      trackWalkthroughStepCompleted(index + 1, tourFor);
      WalkthroughHelpers?.next();
    } else if (index >= tourSteps?.length - 1) {
      setHasReachedLastStep(true);
    }
  };

  useEffect(() => {
    if (startWalkthrough && runTourWithABTest) {
      trackWalkthroughViewed();
    }
  }, [runTourWithABTest, startWalkthrough]);

  useEffect(() => {
    return () => {
      if (hasReachedLastStep) trackWalkthroughCompleted();
    };
  }, [hasReachedLastStep]);

  return (
    <>
      {startWalkthrough && (
        <JoyRide
          ref={joyrideRef}
          run={startWalkthrough && runTourWithABTest}
          steps={productTours[tourFor]}
          continuous={true}
          callback={callback}
          tooltipComponent={renderCustomToolTip}
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
