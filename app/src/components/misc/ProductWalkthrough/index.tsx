import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import JoyRide, { EVENTS, STATUS, CallBackProps, TooltipRenderProps } from "react-joyride";
import { productTours } from "./tours";
import { WalkthroughTooltip } from "./Tooltip";
import {
  trackWalkthroughCompleted,
  trackWalkthroughStepCompleted,
  trackWalkthroughViewed,
} from "modules/analytics/events/misc/productWalkthrough";
import { actions } from "store";

interface TourProps {
  startWalkthrough: boolean;
  tourFor: string;
  context?: any;
  runTourWithABTest?: boolean; //temporary flag
  onTourComplete: () => void;
}

export const ProductWalkthrough: React.FC<TourProps> = ({
  startWalkthrough = false,
  tourFor,
  context,
  runTourWithABTest = true,
  onTourComplete,
}) => {
  const dispatch = useDispatch();

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
      dispatch(actions.updateProductTourCompleted({ tour: "isRedirectRuleTourCompleted" }));
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      trackWalkthroughStepCompleted(index + 1, tourFor);
      WalkthroughHelpers?.next();
    }
    if (type === EVENTS.TOUR_END) {
      onTourComplete();
      trackWalkthroughCompleted(tourFor);
    }
  };

  useEffect(() => {
    if (startWalkthrough && runTourWithABTest) {
      trackWalkthroughViewed(tourFor);
    }
  }, [runTourWithABTest, startWalkthrough, tourFor]);

  return (
    <>
      {startWalkthrough && (
        <JoyRide
          ref={joyrideRef}
          run={startWalkthrough && runTourWithABTest}
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
