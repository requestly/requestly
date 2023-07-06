import React, { useState, useEffect, ComponentType } from "react";
import { useSelector } from "react-redux";
// UTILS
import { getUserAuthDetails } from "../../../store/selectors";
// SUB COMPONENTS
import LoginRequiredCTA from "../LoginRequiredCTA";
import PremiumRequiredCTA from "../../payments/PremiumRequiredCTA";

interface Props<P = {}> {
  component: ComponentType<P>;
  premiumRequired?: boolean;
  premiumMessage?: string;
  routeSrc?: string;
  hardRedirect?: boolean;
}

const ProtectedRoute: React.FC<Props> = ({
  component: Component,
  premiumRequired,
  premiumMessage,
  routeSrc,
  hardRedirect = false,
  ...rest
}) => {
  // Global State
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    if (!isPremiumUser) {
      setIsPremiumUser(user.details?.isPremium);
    }
  }, [user, isPremiumUser]);

  return (
    <React.Fragment>
      {user.loggedIn ? (
        premiumRequired && !isPremiumUser ? (
          <PremiumRequiredCTA message={premiumMessage} />
        ) : (
          <Component {...rest} />
        )
      ) : (
        <>
          <LoginRequiredCTA src={routeSrc} hardRedirect={hardRedirect} />
        </>
      )}
    </React.Fragment>
  );
};

export default ProtectedRoute;
