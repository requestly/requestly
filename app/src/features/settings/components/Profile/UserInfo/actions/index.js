//UTILS
import { updateUserProfileInFirestore } from "backend/auth/updateUserProfileInFirestore";
import DataStoreUtils from "../../../../../../utils/DataStoreUtils";

export const updateUserProfile = (uid, profile) => {
  const { CompanyName, displayName, Address } = profile;

  // Build object to save
  const updatedProfile = {};
  if (CompanyName) updatedProfile["companyName"] = CompanyName;
  if (displayName) updatedProfile["displayName"] = displayName;
  if (Address) {
    const { AddrLine1, AddrLine2, AddrCity, AddrState, AddrCountry, AddrZIP } = Address;
    updatedProfile["address"] = {};
    if (AddrLine1) updatedProfile["address"]["line1"] = AddrLine1;
    if (AddrLine2) updatedProfile["address"]["line2"] = AddrLine2;
    if (AddrCity) updatedProfile["address"]["city"] = AddrCity;
    if (AddrState) updatedProfile["address"]["state"] = AddrState;
    if (AddrCountry) updatedProfile["address"]["country"] = AddrCountry;
    if (AddrZIP) updatedProfile["address"]["postal_code"] = AddrZIP;
  }

  // Save change to DB
  return updateUserProfileInFirestore(uid, updatedProfile);
};
