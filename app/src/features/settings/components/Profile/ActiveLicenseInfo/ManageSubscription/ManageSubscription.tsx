import { useDispatch } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";

const ManageSubscription = () => {
  const dispatch = useDispatch();

  return (
    <RQButton
      onClick={() => {
        dispatch(
          actions.toggleActiveModal({
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
