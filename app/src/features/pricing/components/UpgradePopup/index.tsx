import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RequestFeatureModal } from "./RequestFeatureModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { OrganizationsDetails } from "./types";

interface UpgradePopupProps {
  isOpen?: boolean;
  toggleModal?: () => void;
  onContinue?: () => void;
}

export const UpgradePopup: React.FC<UpgradePopupProps> = ({ isOpen, toggleModal, onContinue }) => {
  const user = useSelector(getUserAuthDetails);
  const [organizationsData, setOrganizationsData] = useState(null);

  const getEnterpriseAdminDetails = useMemo(
    () =>
      httpsCallable<null, { enterpriseData: OrganizationsDetails; success: boolean }>(
        getFunctions(),
        "getEnterpriseAdminDetails"
      ),
    []
  );

  useEffect(() => {
    if (user.loggedIn) {
      getEnterpriseAdminDetails().then((response) => {
        if (response.data.success) {
          setOrganizationsData(response.data.enterpriseData);
        }
      });
    }
  }, [user.loggedIn, getEnterpriseAdminDetails]);

  return (
    <>
      {!organizationsData && (
        <RequestFeatureModal
          isOpen={isOpen}
          toggleModal={toggleModal}
          organizationsData={organizationsData}
          onContinue={onContinue}
        />
      )}
    </>
  );
};
