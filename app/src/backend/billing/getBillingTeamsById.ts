import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";

export const getBillingTeamsById = async (userId: string): Promise<{ id: string; data: BillingTeamDetails }[]> => {
  const db = getFirestore(firebaseApp);
  const billingTeamsQuery = query(collection(db, "billing"), where(`owner`, "==", userId));
  const billingTeamsSnapshot = await getDocs(billingTeamsQuery);
  return new Promise((resolve, reject) => {
    const billingTeams = billingTeamsSnapshot.docs.map((doc) => {
      return { data: doc?.data() as BillingTeamDetails, id: doc?.id };
    });
    resolve(billingTeams);
  });
};
