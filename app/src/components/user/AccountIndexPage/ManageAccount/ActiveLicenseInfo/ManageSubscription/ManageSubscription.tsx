import { Button } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";
import { redirectToUrl } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";

const ManageSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = () => {
    setIsLoading(true);

    const manageSubscription = httpsCallable(getFunctions(), "subscription-manageSubscription");
    manageSubscription({})
      .then((res: any) => {
        if (res?.data?.success) {
          redirectToUrl(res?.data?.data?.portalUrl);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("Error in managing subscription. Please contact support contact@requestly.io");
        setIsLoading(false);
      });
  };

  return (
    <Button loading={isLoading} onClick={() => handleManageSubscription()}>
      Manage Subscription
    </Button>
  );
};

export default ManageSubscription;
