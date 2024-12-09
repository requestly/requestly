import { useDispatch } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";

const ManageSubscription = () => {
  const dispatch = useDispatch();

  return (
    <RQButton
      onClick={() => {
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "pricingModal",
            newValue: true,
            newProps: { selectedPlan: null, source: "my-account" },
          })
        );
      }}
    >
      Manage Subscription
    </RQButton>
  );
};

export default ManageSubscription;
