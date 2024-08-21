import { SharedLists } from "./components/SharedLists/SharedLists";
import "./sharedListScreen.scss";

export const SharedListsScreen = () => {
  return (
    <div className="sharedlists-screen-container">
      <div className="sharedlists-screen">
        <SharedLists />
      </div>
    </div>
  );
};
